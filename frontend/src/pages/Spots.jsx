import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import SpotCard from '../components/SpotCard';
import { FaSearch, FaMapMarkerAlt, FaList, FaMap } from 'react-icons/fa';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet with Vite
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom marker icons based on availability
const getMarkerIcon = (availableSpots, totalSpots, isFree) => {
  let color = '#10b981'; // green - available
  if (isFree) color = '#3b82f6'; // blue - free
  else if (availableSpots === 0) color = '#ef4444'; // red - full
  else if (availableSpots < 5) color = '#f59e0b'; // yellow - limited
  
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background: ${color};
      color: white;
      border-radius: 50%;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
      border: 3px solid white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      cursor: pointer;
      transition: transform 0.2s;
    ">${availableSpots}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36]
  });
};

// Component to fit map bounds to markers
const FitBounds = ({ spots }) => {
  const map = useMap();
  
  useEffect(() => {
    if (spots && spots.length > 0) {
      const bounds = L.latLngBounds(
        spots.map(spot => [spot.coordinates.lat, spot.coordinates.lng])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [spots, map]);
  
  return null;
};

const Spots = () => {
  const navigate = useNavigate();
  const [spots, setSpots] = useState([]);
  const [filteredSpots, setFilteredSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    city: 'all',
    freeOnly: false
  });

  const cities = ['all', 'London', 'Manchester', 'Birmingham', 'Leeds', 'Bristol'];

  useEffect(() => {
    const fetchSpots = async () => {
      try {
        const res = await api.get('/spots');
        setSpots(res.data.data);
        setFilteredSpots(res.data.data);
      } catch (error) {
        console.error('Error fetching spots:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSpots();
  }, []);

  useEffect(() => {
    let filtered = [...spots];
    
    if (filters.search) {
      filtered = filtered.filter(spot => 
        spot.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        spot.location.toLowerCase().includes(filters.search.toLowerCase()) ||
        spot.city.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    
    if (filters.city !== 'all') {
      filtered = filtered.filter(spot => spot.city === filters.city);
    }
    
    if (filters.freeOnly) {
      filtered = filtered.filter(spot => spot.isFree === true);
    }
    
    setFilteredSpots(filtered);
  }, [filters, spots]);

  const handleMarkerClick = (spot) => {
    setSelectedSpot(spot);
    // Scroll to spot detail on mobile
    if (window.innerWidth < 768) {
      document.getElementById('spot-detail-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="container" style={{ paddingTop: '40px' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        marginBottom: '20px' 
      }}>
        <div>
          <h1 style={{ fontSize: '32px', marginBottom: '4px' }}>Find Parking</h1>
          <p style={{ color: '#6b7280' }}>
            <FaMapMarkerAlt style={{ display: 'inline', marginRight: '4px' }} />
            {filteredSpots.length} spots available
          </p>
        </div>
        
        {/* View Toggle */}
        <div style={{ display: 'flex', gap: '8px', background: '#f3f4f6', padding: '4px', borderRadius: '12px' }}>
          <button
            onClick={() => setViewMode('map')}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '8px',
              background: viewMode === 'map' ? '#4f46e5' : 'transparent',
              color: viewMode === 'map' ? 'white' : '#6b7280',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: '500',
              transition: 'all 0.3s ease'
            }}
          >
            <FaMap /> Map
          </button>
          <button
            onClick={() => setViewMode('list')}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '8px',
              background: viewMode === 'list' ? '#4f46e5' : 'transparent',
              color: viewMode === 'list' ? 'white' : '#6b7280',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: '500',
              transition: 'all 0.3s ease'
            }}
          >
            <FaList /> List
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '16px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
        marginBottom: '24px',
        display: 'flex',
        gap: '16px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
          <FaSearch style={{ position: 'absolute', top: '50%', left: '12px', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input
            type="text"
            placeholder="Search by name, location..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            style={{
              width: '100%',
              padding: '12px 16px 12px 40px',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              fontSize: '16px',
              outline: 'none',
              transition: 'border-color 0.3s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          />
        </div>
        
        <select
          value={filters.city}
          onChange={(e) => setFilters({ ...filters, city: e.target.value })}
          style={{
            padding: '12px 16px',
            border: '2px solid #e5e7eb',
            borderRadius: '12px',
            fontSize: '16px',
            background: 'white',
            minWidth: '150px',
            outline: 'none',
            transition: 'border-color 0.3s'
          }}
          onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
          onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
        >
          {cities.map(city => (
            <option key={city} value={city}>
              {city === 'all' ? 'All Cities' : city}
            </option>
          ))}
        </select>
        
        <label style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          cursor: 'pointer',
          padding: '8px 12px',
          borderRadius: '8px',
          background: filters.freeOnly ? '#e0e7ff' : 'transparent',
          transition: 'background 0.3s'
        }}>
          <input
            type="checkbox"
            checked={filters.freeOnly}
            onChange={(e) => setFilters({ ...filters, freeOnly: e.target.checked })}
            style={{ width: '18px', height: '18px', accentColor: '#4f46e5', cursor: 'pointer' }}
          />
          <span style={{ fontWeight: '500', color: '#4b5563' }}>Free Only</span>
        </label>
      </div>

      {/* Map & Results Container */}
      {loading ? (
        <div className="loading">Loading parking spots...</div>
      ) : filteredSpots.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 40px' }}>
          <FaMapMarkerAlt style={{ fontSize: '48px', color: '#d1d5db', marginBottom: '16px' }} />
          <h3>No Parking Spots Found</h3>
          <p style={{ color: '#6b7280' }}>Try adjusting your search filters.</p>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: viewMode === 'map' ? '1fr 1fr' : '1fr',
          gap: '24px'
        }}>
          {/* Map Section */}
          <div style={{ 
            gridColumn: viewMode === 'map' ? '1 / 2' : '1',
            minHeight: viewMode === 'map' ? '600px' : '400px'
          }}>
            <div style={{
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              height: viewMode === 'map' ? '600px' : '400px',
              position: 'relative'
            }}>
              <MapContainer
                center={[51.5074, -0.1278]} // London center
                zoom={12}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <FitBounds spots={filteredSpots} />
                
                {filteredSpots.map(spot => (
                  <Marker
                    key={spot._id}
                    position={[spot.coordinates.lat, spot.coordinates.lng]}
                    icon={getMarkerIcon(spot.availableSpots, spot.totalSpots, spot.isFree)}
                    eventHandlers={{
                      click: () => handleMarkerClick(spot)
                    }}
                  >
                    <Popup>
                      <div style={{ padding: '8px', minWidth: '200px' }}>
                        <h4 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>{spot.name}</h4>
                        <p style={{ margin: '4px 0', fontSize: '13px', color: '#6b7280' }}>
                          <FaMapMarkerAlt style={{ display: 'inline', marginRight: '4px' }} />
                          {spot.location}, {spot.city}
                        </p>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          margin: '8px 0',
                          fontSize: '14px'
                        }}>
                          <span>Available: <strong style={{ color: '#10b981' }}>{spot.availableSpots}</strong></span>
                          <span>{spot.isFree ? '🆓 FREE' : `£${spot.hourlyRate}/hr`}</span>
                        </div>
                        <button
                          onClick={() => navigate(`/spots/${spot._id}`)}
                          style={{
                            width: '100%',
                            padding: '8px',
                            background: '#4f46e5',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            marginTop: '8px'
                          }}
                        >
                          Book Now
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
              
              {/* Map Legend */}
              <div style={{
                position: 'absolute',
                bottom: '20px',
                right: '20px',
                background: 'white',
                padding: '12px 16px',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                fontSize: '13px',
                zIndex: 1000
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ 
                    display: 'inline-block', 
                    width: '12px', 
                    height: '12px', 
                    borderRadius: '50%', 
                    background: '#10b981' 
                  }}></span>
                  <span>Available (10+)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ 
                    display: 'inline-block', 
                    width: '12px', 
                    height: '12px', 
                    borderRadius: '50%', 
                    background: '#f59e0b' 
                  }}></span>
                  <span>Limited (1-5)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ 
                    display: 'inline-block', 
                    width: '12px', 
                    height: '12px', 
                    borderRadius: '50%', 
                    background: '#ef4444' 
                  }}></span>
                  <span>Full (0)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ 
                    display: 'inline-block', 
                    width: '12px', 
                    height: '12px', 
                    borderRadius: '50%', 
                    background: '#3b82f6' 
                  }}></span>
                  <span>Free Parking</span>
                </div>
              </div>
            </div>
          </div>

          {/* List Section */}
          {viewMode === 'map' ? (
            <div style={{ 
              gridColumn: '2 / 3',
              maxHeight: '600px',
              overflowY: 'auto',
              paddingRight: '8px'
            }} id="spot-detail-section">
              {selectedSpot ? (
                <div className="card spot-card" style={{ marginBottom: '16px' }}>
                  <div className="spot-card-header">
                    <h3>{selectedSpot.name}</h3>
                    <div className="location">
                      <FaMapMarkerAlt /> {selectedSpot.location}, {selectedSpot.city}
                    </div>
                  </div>
                  <div className="spot-card-body">
                    <div className="info">
                      <span className="label">Available</span>
                      <span className="value">
                        <span className={`availability-dot ${
                          selectedSpot.availableSpots > 10 ? 'available' : 
                          selectedSpot.availableSpots > 0 ? 'limited' : 'full'
                        }`}></span>
                        {selectedSpot.availableSpots} spots
                      </span>
                    </div>
                    <div className="info">
                      <span className="label">Price</span>
                      <span className="value" style={{ fontWeight: '700', color: '#4f46e5' }}>
                        {selectedSpot.isFree ? 'FREE' : `£${selectedSpot.hourlyRate}/hour`}
                      </span>
                    </div>
                    <div className="info">
                      <span className="label">Max Stay</span>
                      <span className="value">{selectedSpot.maxStay} hours</span>
                    </div>
                  </div>
                  <div className="spot-card-footer">
                    <button
                      onClick={() => navigate(`/spots/${selectedSpot._id}`)}
                      className="btn btn-primary"
                      style={{ width: '100%', justifyContent: 'center' }}
                    >
                      View Details & Book
                    </button>
                  </div>
                </div>
              ) : (
                <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <FaMapMarkerAlt style={{ fontSize: '32px', color: '#d1d5db', marginBottom: '8px' }} />
                  <p style={{ color: '#6b7280' }}>Click a marker on the map to see spot details</p>
                </div>
              )}
              
              {/* Full list of spots below selected */}
              <div style={{ marginTop: '16px' }}>
                <h4 style={{ marginBottom: '12px', color: '#6b7280' }}>All Spots</h4>
                {filteredSpots.map(spot => (
                  <div 
                    key={spot._id}
                    onClick={() => setSelectedSpot(spot)}
                    style={{
                      padding: '12px 16px',
                      marginBottom: '8px',
                      background: selectedSpot?._id === spot._id ? '#e0e7ff' : 'white',
                      borderRadius: '12px',
                      border: selectedSpot?._id === spot._id ? '2px solid #4f46e5' : '1px solid #e5e7eb',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedSpot?._id !== spot._id) {
                        e.currentTarget.style.borderColor = '#4f46e5';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedSpot?._id !== spot._id) {
                        e.currentTarget.style.borderColor = '#e5e7eb';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong>{spot.name}</strong>
                        <div style={{ fontSize: '13px', color: '#6b7280' }}>
                          {spot.location}, {spot.city}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: '600', color: '#4f46e5' }}>
                          {spot.isFree ? 'FREE' : `£${spot.hourlyRate}`}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          {spot.availableSpots} available
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // List view only
            <div className="spots-grid">
              {filteredSpots.map(spot => (
                <SpotCard key={spot._id} spot={spot} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Spots;