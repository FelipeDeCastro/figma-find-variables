import React, { useState, useRef, useEffect } from 'react';
import VariableListItem from "./VariableListItem";
import variableIcon from '../assets/variable.svg';
import variableIconBrand from '../assets/variable-brand.svg';
import refreshIcon from '../assets/refresh.svg';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/ui.css';

function App() {
  const [variablesInUse, setVariablesInUse] = useState([]);
  const [loadingDone, setLoadingDone] = useState(false);
  const [showPreloader, setShowPreloader] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [collectionFilter, setCollectionFilter] = useState('all');
  
  // 1. Add searchTerm state
  const [searchTerm, setSearchTerm] = useState('');

  const variablesInUseRef = useRef([]);
  const loadingDoneRef = useRef(false);

  const onFindVariables = () => {
    setVariablesInUse([]);
    setLoadingDone(false);
    setShowPreloader(true);
    parent.postMessage({ pluginMessage: { type: 'find-variables' } }, '*');
  };

  const handleFilterChange = (event) => {
    setFilterType(event.target.value);
  };

  const handleCollectionChange = (event) => {
    setCollectionFilter(event.target.value);
  };
  
  // 3. Handle search term change
  const handleSearchTermChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const uniqueCollections = Array.from(new Set(variablesInUse.map(v => v.collectionId))).map(id => {
    const variable = variablesInUse.find(v => v.collectionId === id);
    return { id, name: variable?.collectionName || `Collection ${id}` };
  });

  // 4. Update filtering logic to include search term
  let filteredVariables = variablesInUse.filter(variable => {
    const typeMatch = filterType === 'all' || variable.type === filterType;
    const collectionMatch = collectionFilter === 'all' || variable.collectionId === collectionFilter;
    const termMatch = searchTerm.trim() === '' || variable.name.toLowerCase().includes(searchTerm.toLowerCase());
    return typeMatch && collectionMatch && termMatch;
  });

  React.useEffect(() => {
    window.onmessage = (event) => {
      const { type, message } = event.data.pluginMessage;
      if (type === 'variables-imported') {
        setVariablesInUse((prevVariablesInUse) => [...prevVariablesInUse, ...message.variables]);
        setLoadingDone(true);
      }
    };
  }, []);

  useEffect(() => {
    variablesInUseRef.current = variablesInUse;
  }, [variablesInUse]);

  useEffect(() => {
    loadingDoneRef.current = loadingDone;
  }, [loadingDone]);

  return (
    <div>
      {!loadingDone ? (
        <div className="page">
          <AnimatePresence>
            {!showPreloader ? (
              <motion.div className="initial-state"
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                key="initial-state"
              >
                <motion.img
                  src={variableIcon}
                />
                <p className="paragraph">Scan your page to find which variables are being used by different layers.</p>
                <button className="button" onClick={onFindVariables}>
                  Find Variables
                </button>
              </motion.div>
            ) : (
              <div className="loading-state"
                key="loading-state"
              >
                <img
                  src={variableIconBrand}
                  className="loading-icon"
                />
              </div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <div>
          {variablesInUse.length === 0 ? (
            <div className="page">
              <div className="empty-state">
                <p className="paragraph">Hmm, we couldn't find any variables being used on this page. Navigate to a new page and try again.</p>
                <button className="button" onClick={onFindVariables}>
                  Find Variables
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="filters">
                {/* 2. Add search input field */}
                <input
                  type="text"
                  placeholder="Search variables..."
                  value={searchTerm}
                  onChange={handleSearchTermChange}
                  className="search-input"
                />
                <select value={filterType} onChange={handleFilterChange}>
                  <option value="all">All Types</option>
                  <option value="boolean">Boolean</option>
                  <option value="string">String</option>
                  <option value="number">Number</option>
                  <option value="color">Color</option>
                </select>
                <select value={collectionFilter} onChange={handleCollectionChange}>
                  <option value="all">All Collections</option>
                  {uniqueCollections.map((collection) => (
                    <option key={collection.id} value={collection.id}>
                      {collection.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="variables-count"><h3>Found {filteredVariables.length} variables</h3></div>
              <div className="title-wrapper">
                <h3 className="table-header border-right">Variable</h3>
                <h3 className="table-header">Value</h3>
              </div>
              <ul className="variable-list">
                {filteredVariables.map((variable, index) => (
                  <VariableListItem key={index} variable={variable} />
                ))}
              </ul>             
              <motion.div className="refresh" onClick={onFindVariables} whileTap={{ scale: 0.98, opacity: 0.8 }}>
                <motion.img
                  src={refreshIcon}
                />
              </motion.div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
