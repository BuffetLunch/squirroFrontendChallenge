import './App.css';
import React, { useState, useEffect } from 'react';

const restEndpoint = "http://localhost:3000/";
const flagEndpoint = "https://restcountries.com/v3.1/alpha/"

const callRestApi = async (param) => {
  
  const response = await fetch(restEndpoint+param);
  const jsonResponse = await response.json();
  let countryFlags = {};
  let booksInfo = {};
  let authorInfo = {};

  
  for (const item of jsonResponse.included) {
    if (item.type === 'countries') {
      const flagResponse = await fetch(flagEndpoint+item.attributes.code+"?fields=flags");
      const flagJson = await flagResponse.json();
      countryFlags[item.id] = flagJson.flags.svg;
    } else if (item.type === 'books') {
      booksInfo[item.id] = {...item.attributes, authorId: item.relationships.author.data.id}
    } else if (item.type === 'authors') {
      authorInfo[item.id] = item.attributes
    }
  }

  for (const element of jsonResponse.data) {
    let dt = new Date(element.attributes.establishmentDate);
    let dtString = ('0' + dt.getDate()).slice(-2) + '.'
    + ('0' + (dt.getMonth()+1)).slice(-2) + '.'
    + dt.getFullYear();
    element.attributes.establishmentDate = dtString
    element.attributes.countryFlag = countryFlags[element.relationships.countries.data.id]
  
    element.attributes.books = []
    if ("books" in element.relationships) {
      for (const bookItem of element.relationships.books.data) {
        element.attributes.books.push({...booksInfo[bookItem.id], id: bookItem.id, authorName: authorInfo[booksInfo[bookItem.id].authorId].fullName})
      }
      element.attributes.books.sort((a,b) => {
        return b.copiesSold - a.copiesSold
      })
      element.attributes.books = element.attributes.books.splice(0,2)
    }
  }
  
  //return JSON.stringify(jsonResponse);
  const arrayOfLists = jsonResponse.data.map(
    record => <li key={record.id} className="rounded-top-right-20 rounded-bottom-20">
        <div>
          <img src={record.attributes.storeImage} alt="" style={{ width: 150, height: 150, borderRadius: 150/2}}/>
          <h1>{record.attributes.name}</h1>
          <h2>Best-selling books</h2>
          {
            record.attributes.books.length > 0 && 
            <ul>
              {record.attributes.books.map(book => <li key={book.id}> {book.name} by {book.authorName}</li>)}
            </ul>
          }
          {record.attributes.books.length === 0 && <p> No data available </p>}
        </div>
        <div>
          <span style={{ float: 'left' }}>
            {record.attributes.establishmentDate} - {record.attributes.website}
          </span>
          <img src={record.attributes.countryFlag} alt="" style={{ width: 60, height: 40, float: 'right'}}/>
        </div>
      </li>
  )
  return arrayOfLists;
};

function App() {
  
  const [apiResponse, setApiResponse] = useState();

  useEffect(() => {
    callRestApi("stores").then(
        result => setApiResponse(result));
  },[]);


  return (
    <div className="App">
      <ul className="list-group">{apiResponse}</ul>
    </div>
  );
}

export default App;
