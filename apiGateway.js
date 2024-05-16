const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const bodyParser = require('body-parser');
const cors = require('cors');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Load proto files for voiture and reservation 
const voitureProtoPath = 'voiture.proto';
const reservationProtoPath = 'reservation.proto';
const resolvers = require('./resolvers');
const typeDefs = require('./schema');
const { Kafka } = require('kafkajs');
const kafka = new Kafka({
    clientId: 'my-app',
    brokers: ['localhost:9092']
});
// Create a new Express application
const app = express();
const voitureProtoDefinition = protoLoader.loadSync(voitureProtoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});
const reservationProtoDefinition = protoLoader.loadSync(reservationProtoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});
app.use(bodyParser.json());
const voitureProto = grpc.loadPackageDefinition(voitureProtoDefinition).voiture;
const reservationProto = grpc.loadPackageDefinition(reservationProtoDefinition).reservation;

// Create ApolloServer instance with imported schema and resolvers
const server = new ApolloServer({ typeDefs, resolvers });
const consumer = kafka.consumer({ groupId: 'api-gateway-consumer' });

consumer.subscribe({ topic: 'voiture_topic' });
consumer.subscribe({ topic: 'reservation_topic' });

(async () => {
    await consumer.connect();
    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            console.log(`Received message: ${message.value.toString()}, from topic: ${topic}`);
        },
    });
})();
// Apply ApolloServer middleware to Express application
server.start().then(() => {
    app.use(
        cors(),
        bodyParser.json(),
        expressMiddleware(server),
    );
});

app.get('/voitures', (req, res) => {
    const client = new voitureProto.VoitureService('localhost:50051',
        grpc.credentials.createInsecure());
    client.searchVoitures({}, (err, response) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(response.voitures);
        }
    });
});

app.get('/voitures/:id', (req, res) => {
    const client = new voitureProto.VoitureService('localhost:50051',
        grpc.credentials.createInsecure());
    const id = req.params.id;
    client.getVoiture({ voiture_id: id }, (err, response) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(response.voiture);
        }
    });
});

app.post('/voitures/add', (req, res) => {
    const client = new voitureProto.VoitureService('localhost:50051',
        grpc.credentials.createInsecure());
    const data = req.body;
    const marque =data.marque;
    const modele =data.modele;
    const couleur=data.couleur;
    const desc= data.description
    client.addVoiture({ marque:marque,modele:modele,couleur:couleur,description:desc  }, (err, response) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(response.voiture);
        }
    });

});
app.put('/voitures/update/:id', (req, res) => {
    const client = new voitureProto.VoitureService('localhost:50051',
        grpc.credentials.createInsecure());
    const id = req.params.id; 
    console.log(id);   
    const data = req.body;
    const marque = data.marque;
    const modele = data.modele;
    const couleur = data.couleur;
    const desc = data.description;
    client.updateVoiture({id:id, marque: marque, modele: modele, couleur: couleur, description: desc }, (err, response) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(response.voiture);
        }
    });
   
});
app.delete('/voitures/delete/:id', (req, res) => {
    const client = new voitureProto.VoitureService('localhost:50051',
        grpc.credentials.createInsecure());
    const voitureId = req.params.id; 
    client.deleteVoiture({ id: voitureId }, (err, response) => { 
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(response.voitures);
        }
    });
});

app.get('/reservations', (req, res) => {
    const client = new reservationProto.ReservationService('localhost:50052',
        grpc.credentials.createInsecure());
    client.searchReservations({}, (err, response) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(response.reservation);
        }
    });
});

app.get('/reservations/:id', (req, res) => {
    const client = new reservationProto.ReservationService('localhost:50052',
        grpc.credentials.createInsecure());
    const id = req.params.id;
    client.getReservation({ reservation_id: id }, (err, response) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(response.reservation);
        }
    });
});

app.post('/reservations/add', (req, res) => {
    const client = new reservationProto.ReservationService('localhost:50052',
        grpc.credentials.createInsecure());
    const data = req.body;
    const customer_id=data.customer_id;
    const start_date =data.start_date;
    const end_date =data.end_date;
    const price = data.price ;
    const car_id= data.car_id;
    client.addReservation({ customer_id: customer_id, start_date: start_date,end_date:end_date,price :price ,car_id:car_id }, (err, response) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(response.reservation);
        }
    });
});

// Start Express application
const port = 3000;
app.listen(port, () => {
    console.log(`API Gateway is running on port ${port}`);
});
