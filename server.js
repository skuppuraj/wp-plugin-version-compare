const express = require('express');
const shell = require('shelljs');

const path = require('path');

const app = express();
app.use(express.json()); // Parse JSON requests

// Serve scraper.html
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json()); // For parsing JSON body

app.post('/run-npm', (req, res) => {
    console.log(req.body);
    
    const { command } = req.body; // Expecting { "command": "install some-package" }

    if (!command) {
        return res.status(400).json({ error: 'No command provided' });
    }
// console.log(command);

    // Run the command using shelljs
    const result = shell.exec(`${command}`, { silent: true });

    res.json({
        stdout: result.stdout,
        stderr: result.stderr,
        code: result.code
    });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
