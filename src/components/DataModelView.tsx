import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Table, 
  Key, 
  Layers, 
  ArrowRightLeft, 
  ShieldCheck, 
  Search, 
  Code, 
  CheckCircle2, 
  Sparkles,
  Server,
  FileCode,
  Info
} from 'lucide-react';
import { EntityModel } from '../types';

export const DataModelView: React.FC = () => {
  const [entities, setEntities] = useState<EntityModel[]>([]);
  const [selectedEntityName, setSelectedEntityName] = useState<string>('User');
  const [activeTab, setActiveTab] = useState<'ENTITIES' | 'ERD_DIAGRAM' | 'ACCESS_PATTERNS' | 'JSON_SCHEMA'>('ENTITIES');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchDataModel();
  }, []);

  const fetchDataModel = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/data-model');
      if (res.ok) {
        const data = await res.json();
        setEntities(data.entities || []);
      }
    } catch (err) {
      console.error('Failed to fetch data model schema', err);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedEntity = entities.find(e => e.name === selectedEntityName) || entities[0];

  const filteredEntities = entities.filter(e => 
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.tableName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-4 font-mono text-[#A1A1AA]">
      
      {/* Header Banner */}
      <div className="bg-[#121214] border border-[#1F1F23] p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-cyan-950 border border-cyan-800 rounded-lg text-cyan-400">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-white text-base font-bold tracking-tight">DEEPDATA Core Data Model & ERD Schema</h1>
              <span className="text-[10px] bg-cyan-950 border border-cyan-800 text-cyan-400 px-2 py-0.5 rounded font-bold uppercase">
                Schema v2.4
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Architectural specification for users, authentication, market data, news pipeline, and portfolios.
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex bg-[#09090B] border border-[#1F1F23] p-1 rounded-md text-xs font-bold">
          {[
            { id: 'ENTITIES', label: 'Entity Inspector', icon: Table },
            { id: 'ERD_DIAGRAM', label: 'ERD Topology', icon: Layers },
            { id: 'ACCESS_PATTERNS', label: 'Access Strategies', icon: Server },
            { id: 'JSON_SCHEMA', label: 'Raw API Schema', icon: Code },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded transition-all cursor-pointer ${
                  isActive ? 'bg-[#1F1F23] text-white border border-[#3F3F46]' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-gray-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Container */}
      {isLoading ? (
        <div className="p-12 text-center text-gray-500">Loading DEEPDATA schema specification...</div>
      ) : (
        <>
          {/* TAB 1: ENTITY INSPECTOR */}
          {activeTab === 'ENTITIES' && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              
              {/* Entity Selector Sidebar */}
              <div className="lg:col-span-1 bg-[#121214] border border-[#1F1F23] rounded-lg p-3 space-y-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search entity or table..."
                    className="w-full bg-[#09090B] text-white text-xs pl-8 pr-3 py-1.5 rounded border border-[#1F1F23] focus:border-cyan-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-gray-500 px-2 tracking-wider">PRIMARY ENTITIES ({filteredEntities.length})</p>
                  {filteredEntities.map((entity) => {
                    const isSelected = selectedEntity?.name === entity.name;
                    return (
                      <button
                        key={entity.name}
                        onClick={() => setSelectedEntityName(entity.name)}
                        className={`w-full text-left px-3 py-2 rounded transition-all flex items-center justify-between cursor-pointer border ${
                          isSelected
                            ? 'bg-cyan-950/60 border-cyan-500/80 text-white font-bold'
                            : 'bg-[#09090B] border-[#1F1F23] text-gray-400 hover:text-gray-200'
                        }`}
                      >
                        <div>
                          <span className="text-xs">{entity.name}</span>
                          <span className="block text-[10px] text-gray-500 font-normal">{entity.tableName}</span>
                        </div>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                          entity.category === 'AUTH' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                          entity.category === 'MARKET_DATA' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                          'bg-indigo-950 text-indigo-400 border border-indigo-800'
                        }`}>
                          {entity.category}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Entity Detail View */}
              {selectedEntity && (
                <div className="lg:col-span-3 bg-[#121214] border border-[#1F1F23] rounded-lg p-5 space-y-5">
                  
                  {/* Entity Header */}
                  <div className="flex items-start justify-between border-b border-[#1F1F23] pb-4">
                    <div>
                      <div className="flex items-center space-x-3">
                        <h2 className="text-white text-lg font-bold">{selectedEntity.name}</h2>
                        <code className="text-xs bg-[#09090B] text-cyan-400 px-2 py-0.5 rounded border border-[#1F1F23]">
                          {selectedEntity.tableName}
                        </code>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{selectedEntity.description}</p>
                    </div>
                  </div>

                  {/* Attributes Table */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center space-x-1.5">
                      <Table className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Attributes & Columns Schema</span>
                    </h3>
                    <div className="overflow-x-auto border border-[#1F1F23] rounded-lg">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-[#09090B] text-gray-400 border-b border-[#1F1F23]">
                            <th className="py-2 px-3 font-semibold">Column Name</th>
                            <th className="py-2 px-3 font-semibold">Data Type</th>
                            <th className="py-2 px-3 font-semibold">Key / Index</th>
                            <th className="py-2 px-3 font-semibold">Required</th>
                            <th className="py-2 px-3 font-semibold">Description</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1F1F23] bg-[#09090B]">
                          {selectedEntity.fields.map((f) => (
                            <tr key={f.name} className="hover:bg-[#121214]">
                              <td className="py-2 px-3 font-bold text-white font-mono">{f.name}</td>
                              <td className="py-2 px-3 text-cyan-400 font-mono">{f.type}</td>
                              <td className="py-2 px-3">
                                {f.keyType ? (
                                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold font-mono ${
                                    f.keyType === 'PK' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                                    f.keyType === 'FK' ? 'bg-cyan-950 text-cyan-400 border border-cyan-800' :
                                    'bg-gray-800 text-gray-300'
                                  }`}>
                                    {f.keyType}
                                  </span>
                                ) : (
                                  <span className="text-gray-600">-</span>
                                )}
                              </td>
                              <td className="py-2 px-3 text-gray-300">
                                {f.required ? <span className="text-emerald-400 font-bold">YES</span> : <span className="text-gray-500">NULL</span>}
                              </td>
                              <td className="py-2 px-3 text-gray-400">{f.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Relationships & Access Patterns */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="bg-[#09090B] border border-[#1F1F23] p-3.5 rounded-lg space-y-2">
                      <h4 className="text-xs font-bold text-gray-300 flex items-center space-x-1.5">
                        <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Entity Relationships ({selectedEntity.relationships.length})</span>
                      </h4>
                      <div className="space-y-1.5">
                        {selectedEntity.relationships.map((rel, idx) => (
                          <div key={idx} className="bg-[#121214] p-2 rounded border border-[#1F1F23] text-xs">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-white font-bold">{selectedEntity.name} → {rel.targetEntity}</span>
                              <span className="bg-cyan-950 text-cyan-400 text-[10px] px-1.5 py-0.2 rounded font-bold">{rel.type}</span>
                            </div>
                            <p className="text-[11px] text-gray-400">{rel.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-[#09090B] border border-[#1F1F23] p-3.5 rounded-lg space-y-2">
                      <h4 className="text-xs font-bold text-gray-300 flex items-center space-x-1.5">
                        <Server className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Query Access Strategies</span>
                      </h4>
                      <ul className="space-y-1.5">
                        {selectedEntity.accessPatterns.map((pat, idx) => (
                          <li key={idx} className="bg-[#121214] p-2 rounded border border-[#1F1F23] text-[11px] text-gray-300">
                            {pat}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                </div>
              )}
            </div>
          )}

          {/* TAB 2: ERD TOPOLOGY */}
          {activeTab === 'ERD_DIAGRAM' && (
            <div className="bg-[#121214] border border-[#1F1F23] rounded-lg p-6 space-y-6">
              <div>
                <h2 className="text-white font-bold text-sm">Visual Entity Relationship Diagram (ERD) Topology</h2>
                <p className="text-xs text-gray-400 mt-1">
                  High-density topology mapping primary keys (PK), foreign keys (FK), and indexed relations across DEEPDATA layers.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Auth Column */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 border-b border-amber-800/60 pb-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Authentication Layer</h3>
                  </div>

                  {entities.filter(e => e.category === 'AUTH').map(e => (
                    <div key={e.name} className="bg-[#09090B] border border-amber-800/50 rounded-lg p-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-white font-bold text-xs">{e.name}</span>
                        <code className="text-[10px] text-amber-400">{e.tableName}</code>
                      </div>
                      <div className="text-[10px] space-y-1 font-mono text-gray-400">
                        {e.fields.slice(0, 4).map(f => (
                          <div key={f.name} className="flex justify-between">
                            <span>{f.name}</span>
                            <span className="text-amber-300">{f.keyType || f.type}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Market Data Column */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 border-b border-emerald-800/60 pb-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Market Data & Feeds Layer</h3>
                  </div>

                  {entities.filter(e => e.category === 'MARKET_DATA').map(e => (
                    <div key={e.name} className="bg-[#09090B] border border-emerald-800/50 rounded-lg p-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-white font-bold text-xs">{e.name}</span>
                        <code className="text-[10px] text-emerald-400">{e.tableName}</code>
                      </div>
                      <div className="text-[10px] space-y-1 font-mono text-gray-400">
                        {e.fields.slice(0, 4).map(f => (
                          <div key={f.name} className="flex justify-between">
                            <span>{f.name}</span>
                            <span className="text-emerald-300">{f.keyType || f.type}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Portfolio Column */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 border-b border-indigo-800/60 pb-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                    <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">User Portfolio & Analytics</h3>
                  </div>

                  {entities.filter(e => e.category === 'USER_PORTFOLIO').map(e => (
                    <div key={e.name} className="bg-[#09090B] border border-indigo-800/50 rounded-lg p-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-white font-bold text-xs">{e.name}</span>
                        <code className="text-[10px] text-indigo-400">{e.tableName}</code>
                      </div>
                      <div className="text-[10px] space-y-1 font-mono text-gray-400">
                        {e.fields.slice(0, 4).map(f => (
                          <div key={f.name} className="flex justify-between">
                            <span>{f.name}</span>
                            <span className="text-indigo-300">{f.keyType || f.type}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: ACCESS PATTERNS */}
          {activeTab === 'ACCESS_PATTERNS' && (
            <div className="bg-[#121214] border border-[#1F1F23] rounded-lg p-5 space-y-4">
              <div>
                <h2 className="text-white font-bold text-sm">Query Access Strategies & Optimization</h2>
                <p className="text-xs text-gray-400 mt-1">
                  High-throughput indexing rules designed for sub-millisecond market data reads and token-authenticated session lookups.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {entities.map(e => (
                  <div key={e.name} className="bg-[#09090B] border border-[#1F1F23] p-4 rounded-lg space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-bold text-xs">{e.name} ({e.tableName})</span>
                      <span className="text-[10px] text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded font-bold uppercase">{e.category}</span>
                    </div>
                    <div className="space-y-1.5 pt-1">
                      {e.accessPatterns.map((pat, idx) => (
                        <div key={idx} className="bg-[#121214] p-2 rounded border border-[#1F1F23] text-[11px] text-gray-300 font-mono">
                          {pat}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: JSON SCHEMA */}
          {activeTab === 'JSON_SCHEMA' && (
            <div className="bg-[#121214] border border-[#1F1F23] rounded-lg p-5 space-y-3">
              <div className="flex justify-between items-center">
                <h2 className="text-white font-bold text-sm">Raw JSON Schema Payload from GET /api/data-model</h2>
                <span className="text-xs text-cyan-400 font-mono">HTTP 200 OK</span>
              </div>
              <pre className="bg-[#09090B] border border-[#1F1F23] p-4 rounded-lg text-xs text-cyan-300 overflow-x-auto max-h-[500px] font-mono select-all">
                {JSON.stringify(entities, null, 2)}
              </pre>
            </div>
          )}
        </>
      )}

    </div>
  );
};
