import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import './App.css';

function App() {
  const [cryptoList, setCryptoList] = useState([]);
  const [selectedCrypto, setSelectedCrypto] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [showFavoritesPopup, setShowFavoritesPopup] = useState(false);

  useEffect(() => {
    fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd')
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(data => setCryptoList(data))
      .catch(error => console.error('Error fetching crypto data:', error));
  }, []);

  const fetchPriceHistory = (cryptoId) => {
    fetch(`https://api.coingecko.com/api/v3/coins/${cryptoId}/market_chart?vs_currency=usd&days=30`)
      .then(response => response.json())
      .then(data => {
        const formattedData = data.prices.map(([timestamp, price]) => ({
          date: new Date(timestamp).toLocaleDateString(),
          price: price,
        }));
        setPriceHistory(formattedData);
      })
      .catch(error => console.error('Error fetching price history:', error));
  };

  const handleCryptoClick = (crypto) => {
    setSelectedCrypto(crypto);
    fetchPriceHistory(crypto.id);
  };

  const toggleFavorite = (crypto) => {
    setFavorites((prevFavorites) => {
      const alreadyFavorite = prevFavorites.find(item => item.id === crypto.id);
      return alreadyFavorite ? prevFavorites.filter(item => item.id !== crypto.id) : [...prevFavorites, crypto];
    });
  };

  const closePopup = () => {
    setSelectedCrypto(null);
    setPriceHistory([]);
  };

  const toggleFavoritesPopup = () => {
    setShowFavoritesPopup(!showFavoritesPopup);
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>Crypto Price Tracker</h1>
        <button className="favorites-btn" onClick={toggleFavoritesPopup}>
          Favorites ({favorites.length})
        </button>
      </header>

      <div className="crypto-container">
        {cryptoList.length > 0 ? (
          cryptoList.map((crypto) => (
            <div key={crypto.id} className="crypto-card" onClick={() => handleCryptoClick(crypto)}>
              <h2>{crypto.name}</h2>
              <p>Current Price: ${crypto.current_price}</p>
              <img src={crypto.image} alt={crypto.name} width={50} />
              <button
                className={`favorite-toggle-btn ${favorites.some(item => item.id === crypto.id) ? 'favorited' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(crypto);
                }}
              >
                {favorites.some(item => item.id === crypto.id) ? '❤️ Favorited' : '🤍 Favorite'}
              </button>
            </div>
          ))
        ) : (
          <p>Loading...</p>
        )}
      </div>

      {selectedCrypto && (
        <div className="popup">
          <div className="popup-content">
            <h2>{selectedCrypto.name} Price Trend (Last 30 Days)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={priceHistory}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="price" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
            <button className="close-btn" onClick={closePopup}>Close</button>
          </div>
        </div>
      )}

      {showFavoritesPopup && (
        <div className="popup">
          <div className="popup-content">
            <h2>Your Favorite Cryptocurrencies</h2>
            <ul className="favorites-list">
              {favorites.length > 0 ? (
                favorites.map((crypto) => (
                  <li key={crypto.id} className="favorites-item">
                    <span>{crypto.name} - ${crypto.current_price}</span>
                    <button
                      className="remove-btn"
                      onClick={() => toggleFavorite(crypto)}
                    >
                      Remove
                    </button>
                  </li>
                ))
              ) : (
                <p>No favorites added yet!</p>
              )}
            </ul>
            <button className="close-btn" onClick={toggleFavoritesPopup}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
