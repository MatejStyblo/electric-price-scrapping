import React, { useEffect, useState } from "react";

const MainPage = () => {
  const [data, setData] = useState([]);
  const [actualPrice, setAtualPrice] = useState([]);
  const [priceIwant, setPriceIwant] = useState("");
  const [inputValue, setInputValue] = useState(0);
  const [buying, setbuying] = useState(false);
  const [startTime, setStartTime] = useState(null); // Start time of charging
  const [endTime, setEndTime] = useState(null); // End time of charging

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/scrape");
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 60000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const now = new Date();
    const currentHour = now.getHours() + 1;
    const filterByHour = data?.filter((entry) => {
      return Number(entry.hour) === currentHour;
    });

    if (filterByHour.length > 0) {
      setAtualPrice(filterByHour[0].price);
    }
  }, [data]);

  useEffect(() => {
    if (buying && priceIwant) {
      const actualPriceNumber = parseFloat(actualPrice.replace(",", "."));
      const pricePerKWh = (actualPriceNumber / 1000) * 25;

      if (pricePerKWh < parseFloat(priceIwant)) {
        if (!startTime) {
          setStartTime(new Date()); // Set start time when charging begins
        }
        startCharging();
      } else {
        if (startTime) {
          setEndTime(new Date()); // Set end time when charging stops
        }
        stopCharging();
      }
    }
  }, [actualPrice, buying, priceIwant]);

  const startCharging = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/start-charging", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nakupuju: buying,
        }),
      });
      const result = await response.json();
      console.log("Charging started:", result);
    } catch (error) {
      console.error("Error starting charging:", error);
    }
  };

  const stopCharging = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/stop-charging", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nakupuju: false }),
      });
      const result = await response.json();
      console.log("Charging stopped:", result);
    } catch (error) {
      console.error("Error stopping charging:", error);
    }
  };

  const buyOnClick = () => {
    setbuying(true);
    setPriceIwant(inputValue);
    setStartTime(null); // Reset start time when starting new session
    setEndTime(null); // Reset end time when starting new session
  };

  const dontBuyOnClick = () => {
    setbuying(false);
    setInputValue("0");
    setPriceIwant("0");
    setEndTime(new Date()); // Set end time when charging is manually stopped
  };
  console.log(data);
  
  const actualPriceString = String(actualPrice).replace(",", ".");
  const pricePerKWh = (actualPriceString / 1000) * 25;

  if (data.length === 0) {
    return <div className="loader"></div>;
  }

  return (
    <div className="all-content">
      <h1 className="title-el">Cena elektriky</h1>
      <p className="actual-price">Aktuální cena: {actualPrice} Eur/MWh</p>
      <p className="actual-price">Cena za: {pricePerKWh.toFixed(3)} Kč/KWh</p>
      <div className="form-group">
        <label>
          <input
            type="number"
            placeholder="Zadej cenu v kč za KWh"
            onChange={(e) => setInputValue(e.target.value)}
          />
        </label>

        <button className="button-price" onClick={buyOnClick}>
          Chci kupovat!
        </button>
      </div>
      {buying && pricePerKWh < String(priceIwant) ? (
        <div>
          <h4 className="more-than-acual-price">
            Právě nakupuješ za cenu nižší než je {priceIwant} Kč/KWh
          </h4>
          {startTime && (
            <p className="charging-time">
              Nabíjení začalo: {startTime.toLocaleTimeString()}{" "}
              {endTime && `a skončilo: ${endTime.toLocaleTimeString()}`}
            </p>
          )}
          <button className="stop-buying" onClick={dontBuyOnClick}>
            Nekupovat
          </button>
        </div>
      ) : (
        <div>
          <h4 className="more-than-acual-price">Právě nenakupuješ</h4>
          {startTime && endTime &&pricePerKWh <String(priceIwant) &&(
                <p className="charging-time">
                  Poslední nabíjení od: {startTime.toLocaleTimeString()} do:
                  {endTime.toLocaleTimeString()}
                </p>
              )}
          {pricePerKWh > String(priceIwant) && buying &&(
            <div className="will-buy">
              <h3>
                Začneš nakupovat pokud to klesne pod {priceIwant} Kč/KWh
              </h3>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MainPage;
