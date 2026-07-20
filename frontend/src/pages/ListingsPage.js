import React, { useState, useEffect } from 'react';
import { fetchProperties } from '../api/client';
//import './ListingsPage.css';

function ListingsPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadProperties();
  }, []);

  async function loadProperties() {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchProperties({ limit: 20, offset: 0 });

      setProperties(data.results);
      setTotal(data.total);
    } catch (err) {
      setError('Failed to load properties. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="loading">Loading properties...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="listings-page">
      <h1>Property Listings</h1>
      <p>
        Showing {properties.length} of {total} properties
      </p>

      <div className="property-grid">
        {properties.map((property) => (
          <PropertyCard
            key={property.ListingId}
            property={property}
          />
        ))}
      </div>
    </div>
  );
}

function PropertyCard({ property }) {
  return (
    <div className="property-card">
      <div className="property-image">
        {property.Media ? (
          <img
            src={property.Media}
            alt={property.UnparsedAddress}
          />
        ) : (
          <div className="no-image">
            No image available
          </div>
        )}
      </div>

      <div className="property-info">
        <div className="price">
          ${property.ListPrice?.toLocaleString()}
        </div>

        <div className="address">
          {property.UnparsedAddress}
        </div>

        <div className="city">
          {property.City}, {property.StateOrProvince}
        </div>

        <div className="property-details">
          <span>{property.BedroomsTotal} beds</span>
          <span>•</span>
          <span>{property.BathroomsTotalInteger} baths</span>

          {property.LivingArea && (
            <>
              <span>•</span>
              <span>
                {property.LivingArea.toLocaleString()} sqft
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ListingsPage;