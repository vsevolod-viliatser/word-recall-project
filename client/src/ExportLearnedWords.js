import React from 'react';

const ExportLearnedWords = ({ token }) => {
  const handleExportClick = async () => {
    try {
      const response = await fetch('api/words/export-learned-words', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Include the user's authentication token
        },
      });

      if (response.ok) {
        const csvData = await response.text();

        // Create a Blob object from the CSV data
        const blob = new Blob([csvData], { type: 'text/csv' });

        // Create a temporary URL for the blob object
        const url = window.URL.createObjectURL(blob);

        // Create a link element and set its attributes
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'learned_words.csv');

        // Simulate a click event on the link element to trigger the file save dialog
        link.click();

        // Clean up the temporary URL and link element
        window.URL.revokeObjectURL(url);
        link.remove();
      } else {
        const errorData = await response.json();
        console.error('Error exporting learned words:', errorData.error);
      }
    } catch (error) {
      console.error('Error exporting learned words:', error);
    }
  };

  return (
    <div className="container">
      <h2>Export Learned Words</h2>
      <p>Click the button below to export your learned words as a CSV file.</p>
      <div className="d-flex justify-content-center mt-4">
        <button className="btn btn-primary" onClick={handleExportClick}>Export</button>
      </div>
    </div>
  );
  
};

export default ExportLearnedWords;
