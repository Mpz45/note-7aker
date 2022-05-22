// Import application dependencies
const fs = require('fs');
const express = require('express');
const morganLogger = require('morgan');
const path = require('path');
const dbJsonPath = './db.json'

// Instantiate the server
const app = express();
const PORT = process.env.PORT || 3002;

// Setup middleware to parse json and urlendoded for POST requests
app.use(express.urlencoded({extended: true}));
app.use(express.json());

// Setup middleware function to look up the files relative to the static
// directory.  The name of the static dir is not part of the URL.
// Static files are files clients download from the server.  Express, by
// default does not allow static files, this middleware enables static files.
app.use(express.static('public'));

// Setup morgan middleware to log HTTP requests and errors
app.use(morganLogger('dev'));


app.get('/api/notes', (req, res) => {
   fs.readFile(dbJsonPath, 'utf8', (err, notes) => {
      if (err) {
         console.log( err );
         return;
      };

      res.json(JSON.parse(notes));
   });
});


// Posting new notes to db.json
app.post('/api/notes', (req, res) => {
   const newNote = req.body;
   let notesArr = [];

   // Pull JSON file
   fs.readFile(path.join(__dirname + '/' + dbJsonPath), "utf8", (err, notesData) => {
      if (err) {
          return console.log(err);
      };

      // If the notes file is empty, then add the new note
      if (notesData === '') {
         notesArr.push({'id': 1, 'title': newNote.title, 'text': newNote.text});
      }
      // If the notes file is not empty, JSON parse the notes data into the array first then add new note
      else {
         notesArr = JSON.parse(notesData);
         notesArr.push({'id': notesArr.length, 'title': newNote.title, 'text': newNote.text});
      };

      // Update notes data file with data from notes array
      fs.writeFile((path.join(__dirname + '/' + dbJsonPath)), JSON.stringify(notesArr, null, 2), (error) => {
         if (error) {return console.log(error);
        }

         res.json(notesArr);
      });
   });
});


// Delete user selected note from db.json
app.delete('/api/notes/:id', (req, res) => {
   const idToDelete = req.params.id;
   let notesArr = [];

   // Pull JSON file
   fs.readFile(path.join(__dirname + '/' + dbJsonPath), 'utf8', (err, notesData) => {
      if (err) {
         return console.log(err);
      };

      notesArr = JSON.parse(notesData);

      // Filter out the id for the note to be deleted
      notesArr = notesArr.filter((object) => {
         return object.id != idToDelete; 
      });

      // Re-assign note IDs in the array
      for (let i = 1; i < notesArr.length; i++) {
         notesArr[i].id = i;
      };

      // Update db.json
      fs.writeFile((path.join(__dirname + '/' + dbJsonPath)), JSON.stringify(notesArr), (error) => {
         if (error) { 
             return console.log(error); 
            };

         res.json(notesArr);
      });
   });
});



// Locate and read the file's content, then send it back to the client
app.get('/notes', (req, res) => {
   res.sendFile(path.join(__dirname, './notes.html'));
});


app.get( '*', (req, res) => {
   res.sendFile(path.join(__dirname, './index.html'));
});

// Listen for requests
app.listen(PORT, () => {
   console.log(`API server now on port ${PORT}!`);
});