const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
//const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');
const Voiture = require('./models/voitureModel');
const { Kafka } = require('kafkajs');
const kafka = new Kafka({
    clientId: 'my-app',
    brokers: ['localhost:9092']
});

const producer = kafka.producer();

const voitureProtoPath = 'voiture.proto';
const voitureProtoDefinition = protoLoader.loadSync(voitureProtoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const voitureProto = grpc.loadPackageDefinition(voitureProtoDefinition).voiture;

const url = 'mongodb://localhost:27017/voituresDB';

mongoose.connect(url)
    .then(() => {
        console.log('connected to database!');
    }).catch((err) => {
        console.log(err);
    })
    const consumer = kafka.consumer({ groupId: 'voiture-consumer' });

    consumer.subscribe({ topic: 'reservation_topic' });
    (async () => {
        await consumer.connect();
        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                console.log(`Received message: ${message.value.toString()}, from topic: ${topic}`);
            },
        });
    })();
const voitureService = {
    getVoiture: async (call, callback) => {
        await producer.connect();
        try {
            const voitureId = call.request.voiture_id;
            const voiture = await Voiture.findOne({ _id: voitureId }).exec();
            if (!voiture) {
                callback({ code: grpc.status.NOT_FOUND, message: 'voiture not found' });
                return;
            }
            await producer.send({
                topic: 'voiture_topic',
                messages: [{ value: 'Searched for Voiture id : '+voitureId.toString() }],
            });
            callback(null, { voiture });
        } catch (error) {
            callback({ code: grpc.status.INTERNAL, message: 'Error occurred while fetching voiture' });
        }
    },
    searchVoitures: async(call, callback) => {
        await producer.connect();
        try{
            const voitures = await Voiture.find({}).exec();
            await producer.send({
                topic: 'voiture_topic',
                messages: [{ value: 'Searched for Voitures' }],
            });
            callback(null, { voitures });
        }catch(error){
            callback({ code: grpc.status.INTERNAL, message: 'Error occurred while fetching voitures' });
        }
    },
    addVoiture: async (call, callback) => {
        await producer.connect();
        const { marque,modele,couleur,description } = call.request;
        const newVoiture = new Voiture({ marque,modele,couleur,description});
        try {
            const savedVoiture = await newVoiture.save();
            await producer.send({
                topic: 'voiture_topic',
                messages: [{ value: 'Added new Voiture '+savedVoiture.toString() }],
            });
            callback(null, { voiture: savedVoiture });
        } catch (error) {
            callback({ code: grpc.status.INTERNAL, message: 'Error occurred while adding voiture' });
        }
    },
    updateVoiture: async (call, callback) => {
        const {id, marque,modele,couleur,description } = call.request;
       // console.log(call.request);
        const _id =id;
       // console.log(id);
        await producer.connect();
        try {
            const updatedVoiture = await Voiture.findByIdAndUpdate(_id, { marque,modele,couleur,description}, { new: true });
          //  console.log(updatedVoiture);
          await producer.send({
            topic: 'voiture_topic',
            messages: [{ value: 'Updated Voiture '+updatedVoiture.toString() }],
        });
            callback(null, { voiture: updatedVoiture });
        } catch (error) {
            callback({ code: grpc.status.INTERNAL, message: 'Error occurred while adding voiture' });
        }
    },
    deleteVoiture: async (call, callback) => {
        await producer.connect();
        try {
            const voitureId = call.request.id;
            //console.log(call.request);
            const deletedVoiture = await Voiture.findByIdAndDelete({_id:voitureId});
            if (!Voiture) {
                callback({ code: grpc.status.NOT_FOUND, message: 'voiture not found' });
                return;
            }
            await producer.send({
                topic: 'voiture_topic',
                messages: [{ value: 'Deleted Voiture '+deletedVoiture.toString() }],
            });
            callback(null, { voitures : deletedVoiture});
        } catch (error) {
            callback({ code: grpc.status.INTERNAL, message: 'Error occurred while fetching voiture' });
        }
    }
};

const server = new grpc.Server();
server.addService(voitureProto.VoitureService.service, voitureService);
const port = 50051;
server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(),
    (err, port) => {
        if (err) {
            console.error('Failed to bind server:', err);
            return;
        }
        console.log(`Server is running on port ${port}`);
        server.start();
    });
console.log(`Voiture microservice is running on port ${port}`);
