const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
//const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');
const Reservation = require('./models/reservationModel');
const { Kafka } = require('kafkajs');
const kafka = new Kafka({
    clientId: 'my-app',
    brokers: ['localhost:9092']
});

const producer = kafka.producer();
const reservationProtoPath = 'reservation.proto';
const reservationProtoDefinition = protoLoader.loadSync(reservationProtoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const reservationProto = grpc.loadPackageDefinition(reservationProtoDefinition).reservation;

const url = 'mongodb://localhost:27017/reservationsDB';

mongoose.connect(url)
    .then(() => {
        console.log('connected to database!');
    }).catch((err) => {
        console.log(err);
    })

    const consumer = kafka.consumer({ groupId: 'reservation-consumer' });

consumer.subscribe({ topic: 'voiture_topic' });
(async () => {
    await consumer.connect();
    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            console.log(`Received message: ${message.value.toString()}, from topic: ${topic}`);
        },
    });
})();
const reservationService = {
    getReservation: async (call, callback) => {
        await producer.connect();
        try {
            const reservationId = call.request.reservation_id;
            const reservation = await Reservation.findOne({ _id: reservationId }).exec();
            if (!reservation) {
                callback({ code: grpc.status.NOT_FOUND, message: 'Reservation not found' });
                return;
            }
            await producer.send({
                topic: 'reservation_topic',
                messages: [{ value: 'Searched for Reservation id : '+reservationId.toString() }],
            });
            callback(null, { reservation });
        } catch (error) {
            callback({ code: grpc.status.INTERNAL, message: 'Error occurred while fetching reservation' });
        }
    },
    searchReservations: async(call, callback) => {
        await producer.connect();
        try{
            const reservation = await Reservation.find({}).exec();
            await producer.send({
                topic: 'reservation_topic',
                messages: [{ value: 'Searched for Reservations' }],
            });
            callback(null, { reservation});
        }catch(error){
            callback({ code: grpc.status.INTERNAL, message: 'Error occurred while fetching Reservations' });
        }
    },
    addReservation: async (call, callback) => {
        await producer.connect();
        const { customer_id, start_date,end_date,price  ,car_id } = call.request;
        const newReservation = new Reservation({ customer_id, start_date,end_date,price  ,car_id });
        try {
            const savedReservation = await newReservation.save();
            await producer.send({
                topic: 'reservation_topic',
                messages: [{ value: 'Added a new reservation : '+savedReservation.toString() }],
            });
            callback(null, { reservation: savedReservation });
        } catch (error) {
            callback({ code: grpc.status.INTERNAL, message: 'Error occurred while adding reservation' });
        }
    }
};

const server = new grpc.Server();
server.addService(reservationProto.ReservationService.service, reservationService);
const port = 50052;
server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(),
    (err, port) => {
        if (err) {
            console.error('Failed to bind server:', err);
            return;
        }
        console.log(`Server is running on port ${port}`);
        server.start();
    });
console.log(`Reservation microservice is running on port ${port}`);
