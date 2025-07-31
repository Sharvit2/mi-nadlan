import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MagnifyingGlassIcon, HomeIcon, MapPinIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { propertiesAPI } from '../services/api';

const RentProperties = () => {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    rooms: '',
    street: ''
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [properties, filters]);

  const fetchProperties = async () => {
    try {
      const response = await propertiesAPI.getRentProperties();
      setProperties(response.data);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = properties.filter(property => {
      if (filters.minPrice && property.price < parseInt(filters.minPrice)) return false;
      if (filters.maxPrice && property.price > parseInt(filters.maxPrice)) return false;
      if (filters.rooms && property.rooms !== parseInt(filters.rooms)) return false;
      if (filters.street && !property.street.toLowerCase().includes(filters.street.toLowerCase())) return false;
      return true;
    });
    setFilteredProperties(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-8">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 font-hebrew">
            נכסים להשכרה
          </h1>
          <p className="text-xl text-gray-600 font-hebrew">
            מגוון רחב של דירות ובתים להשכרה בבית שמש
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4 font-hebrew flex items-center">
            <MagnifyingGlassIcon className="h-6 w-6 mr-2" />
            סינון נכסים
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-hebrew">
                שכר דירה מינימלי
              </label>
              <input
                type="number"
                placeholder="₪"
                className="form-input w-full px-3 py-2 border rounded-md"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-hebrew">
                שכר דירה מקסימלי
              </label>
              <input
                type="number"
                placeholder="₪"
                className="form-input w-full px-3 py-2 border rounded-md"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-hebrew">
                מספר חדרים
              </label>
              <select
                className="form-input w-full px-3 py-2 border rounded-md"
                value={filters.rooms}
                onChange={(e) => handleFilterChange('rooms', e.target.value)}
              >
                <option value="">כל החדרים</option>
                <option value="1">1 חדר</option>
                <option value="2">2 חדרים</option>
                <option value="3">3 חדרים</option>
                <option value="4">4 חדרים</option>
                <option value="5">5+ חדרים</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-hebrew">
                רחוב
              </label>
              <input
                type="text"
                placeholder="שם הרחוב"
                className="form-input w-full px-3 py-2 border rounded-md"
                value={filters.street}
                onChange={(e) => handleFilterChange('street', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-700 font-hebrew">
            נמצאו {filteredProperties.length} נכסים להשכרה
          </p>
        </div>

        {/* Properties Grid */}
        {filteredProperties.length === 0 ? (
          <div className="text-center py-12">
            <HomeIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2 font-hebrew">
              לא נמצאו נכסים
            </h3>
            <p className="text-gray-500 font-hebrew">
              נסו לשנות את הפילטרים כדי למצוא נכסים נוספים
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {filteredProperties.map((property) => (
              <Link
                key={property.id}
                to={`/property/${property.id}`}
                className="property-card bg-white rounded-xl overflow-hidden group"
              >
                {/* Property Image */}
                <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 relative overflow-hidden">
                  {property.images && property.images.length > 0 ? (
                    <img
                      src={`${process.env.REACT_APP_BACKEND_URL}${property.images[0]}`}
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <HomeIcon className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold font-hebrew">
                    להשכרה
                  </div>
                </div>

                {/* Property Info */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 text-gray-800 font-hebrew line-clamp-2">
                    {property.title}
                  </h3>
                  
                  <div className="flex items-center text-gray-600 mb-3">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    <span className="text-sm font-hebrew">{property.street}, {property.city}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
                    <div className="font-hebrew">
                      <span className="font-semibold">{property.rooms}</span> חדרים
                    </div>
                    <div className="font-hebrew">
                      <span className="font-semibold">{property.size_sqm}</span> מ״ר
                    </div>
                  </div>

                  {/* Features */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {property.balcony && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-hebrew">
                        מרפסת
                      </span>
                    )}
                    {property.air_conditioning && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-hebrew">
                        מיזוג אוויר
                      </span>
                    )}
                    {property.parking && (
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-hebrew">
                        חניה
                      </span>
                    )}
                    {property.elevator && (
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-hebrew">
                        מעלית
                      </span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-blue-600 font-hebrew">
                      {formatPrice(property.price)}
                      <span className="text-sm text-gray-500 font-normal">/חודש</span>
                    </div>
                    <div className="text-sm text-gray-500 font-hebrew">
                      {property.agent_name}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="bg-blue-600 text-white p-8 rounded-xl text-center">
          <h2 className="text-2xl font-bold mb-4 font-hebrew">
            לא מצאתם מה שחיפשתם?
          </h2>
          <p className="text-lg mb-6 font-hebrew">
            צרו קשר עם הצוות שלנו ונעזור לכם למצוא את הנכס המושלם להשכרה
          </p>
          <a
            href="tel:052-1234567"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 font-hebrew"
          >
            צרו קשר עכשיו
          </a>
        </div>
      </div>
    </div>
  );
};

export default RentProperties;