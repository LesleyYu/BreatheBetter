

// import Papa from 'papaparse';

// export async function fetchCSVData(url: string) {
//   try {
//     const response = await fetch(url);
//     const csvText = await response.text();
    
//     return new Promise((resolve, reject) => {
//       Papa.parse(csvText, {
//         header: true,
//         complete: (results) => {
//           resolve(results.data);
//           console.log("results: \n", results);
//         },
//         error: (error) => {
//           reject(error);
//         }
//       });
//     });
//   } catch (error) {
//     console.error('Error fetching CSV data:', error);
//     throw error;
//   }
// }

// // in App.tsx
// import Papa from "papaparse";
// import { fetchCSVData } from './utils/fetchData.tsx';
// // fetch data
// const [data, setData] = useState([]);

// useEffect(() => {
//   const loadData = async (CSVFilePath) => {
//     try {
//       const csvData = await fetchCSVData(CSVFilePath);
//       setData(csvData);
//     } catch (error) {
//       console.error('Error loading CSV data:', error);
//     }
//   };

//   loadData('../data/YouthUnemployed.csv');
// }, []);




// useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await fetch('../data/YouthUnemployed');
//         console.log("response: \n", response);
//         const reader = response.body.getReader();
//         const result = await reader.read();
//         const decoder = new TextDecoder('utf-8');
//         const csv = decoder.decode(result.value);
//         const results = Papa.parse(csv, { header: true });
//         setData(results.data);
//         console.log("Successfully updated data: \n", results.data)
//       } catch (error) {
//         console.error('Error fetching or parsing CSV:', error);
//       }
//     };

//     fetchData();
//   }, []);





// import React, { useState, useEffect } from 'react';
// import Papa from 'papaparse';

// const CSVDataLoader = (csvFilePath) => {
//   const [data, setData] = useState([]);

// //   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await fetch(csvFilePath);
//         const reader = response.body.getReader();
//         const result = await reader.read();
//         const decoder = new TextDecoder('utf-8');
//         const csv = decoder.decode(result.value);
//         const results = Papa.parse(csv, { header: true });
//         setData(results.data);
//       } catch (error) {
//         console.error('Error fetching or parsing CSV:', error);
//       }
//     };

//     fetchData();
// //   }, [csvFilePath]);

//   return data;
// };

// export default CSVDataLoader;






// //var csv is the CSV file with headers
// export function csvJSON(csv){

//     var lines=csv.split("\n");
  
//     var result = [];
  
//     // NOTE: If your columns contain commas in their values, you'll need
//     // to deal with those before doing the next step 
//     // (you might convert them to &&& or something, then covert them back later)
//     // jsfiddle showing the issue https://jsfiddle.net/
//     var headers=lines[0].split(",");
  
//     for(var i=1;i<lines.length;i++){
  
//         var obj = {};
//         var currentline=lines[i].split(",");
  
//         for(var j=0;j<headers.length;j++){
//             obj[headers[j]] = currentline[j];
//         }
  
//         result.push(obj);
  
//     }
  
//     //return result; //JavaScript object
//     return JSON.stringify(result); //JSON
// }