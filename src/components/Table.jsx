import React, { useEffect, useState } from "react";
import { database, ref, onValue, remove } from "../../firebase";
import "./Table.css";

function Table() {
  const [coffees, setCoffees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [coffeeToDelete, setCoffeeToDelete] = useState(null);
  const [inputFocus, setInputFocus] = useState(false); // State for input focus

  useEffect(() => {
    const coffeesRef = ref(database, "coffees");
    onValue(coffeesRef, (snapshot) => {
      const data = snapshot.val();
      const coffeeList = [];
      for (let id in data) {
        coffeeList.push({ id, ...data[id] });
      }
      setCoffees(coffeeList);
    });
  }, []);

  const handleDeleteClick = (coffee) => {
    setCoffeeToDelete(coffee);
    setShowModal(true);
  };

  const confirmDelete = () => {
    if (coffeeToDelete) {
      const coffeeRef = ref(database, `coffees/${coffeeToDelete.id}`);
      remove(coffeeRef);
      setCoffeeToDelete(null);
      setShowModal(false);
    }
  };

  const cancelDelete = () => {
    setCoffeeToDelete(null);
    setShowModal(false);
  };

  const filteredCoffees = coffees.filter((coffee) =>
    coffee.coffee.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const clearSearch = () => {
    setSearchTerm("");
  };

  return (
    <div className="container">
      <h1 style={{ fontSize: "4rem" }}>TABELA KAW</h1>

      <div className="search-container">
        <input
          type="text"
          placeholder={
            inputFocus ? "📲 ZESKANUJ QR 📲" : "☝ KLIKNIJ ☝ KLIKNIJ ☝"
          }
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
          onFocus={() => setInputFocus(true)}
          onBlur={() => setInputFocus(false)}
        />
        <button className="clear-button" onClick={clearSearch}>
          ✖
        </button>
      </div>

      <table className="coffee-table">
        <thead>
          <tr>
            <th></th>
            <th>Kawa</th>
            <th>Usuń</th>
          </tr>
        </thead>
        <tbody>
          {filteredCoffees.length > 0 ? (
            filteredCoffees.map((coffee) => (
              <tr key={coffee.id}>
                <td>☕</td>
                <td>{coffee.coffee}</td>
                <td>
                  <button onClick={() => handleDeleteClick(coffee)}>
                    WYDANO
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3">Brak wyników</td>
            </tr>
          )}
        </tbody>
      </table>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Potwierdzenie</h2>
            <p>Czy na pewno wydano kawę: {coffeeToDelete.coffee}?</p>
            <button onClick={confirmDelete} className="yes">
              TAK
            </button>
            <button onClick={cancelDelete} className="no">
              NIE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Table;
