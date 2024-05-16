const mongoose = require('mongoose');

const voitureSchema = new mongoose.Schema({
    marque : String,
    modele : String,
    couleur : String,
    description: String,
});

const Voiture = mongoose.model('Voiture', voitureSchema);

module.exports = Voiture;