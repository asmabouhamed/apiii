// resolvers.js
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
// Charger les fichiers proto pour les voitures et lesreservation
const voitureProtoPath = 'voiture.proto';
const reservationProtoPath = 'reservation.proto';
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
const voitureProto = grpc.loadPackageDefinition(voitureProtoDefinition).voiture;
const reservationProto = grpc.loadPackageDefinition(reservationProtoDefinition).reservation;
// Définir les résolveurs pour les requêtes GraphQL
const resolvers = {
    Query: {
        voiture: (_, { id }) => {
            // Effectuer un appel gRPC au microservice de voiture
            const client = new voitureProto.VoitureService('localhost:50051',
                grpc.credentials.createInsecure());
            return new Promise((resolve, reject) => {
                client.getVoiture({ voiture_id: id }, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.voiture);
                    }
                });
            });
        },
        addVoiture: (_, { marque:marque,modele:modele,couleur:couleur,description:desc}) => {
            // Effectuer un appel gRPC au microservice de voiture
            const client = new voitureProto.VoitureService('localhost:50051',
                grpc.credentials.createInsecure());
            return new Promise((resolve, reject) => {
                client.addVoiture({ marque:marque,modele:modele,couleur:couleur,description:desc }, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.voiture);
                    }
                });
            });
        },
        voitures: () => {
            // Effectuer un appel gRPC au microservice de films
            const client = new voitureProto.VoitureService('localhost:50051',
                grpc.credentials.createInsecure());
            return new Promise((resolve, reject) => {
                client.searchVoitures({}, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.voitures);
                    }
                });
            });
        },
        addReservation: (_, { customer_id: customer_id, start_date: start_date,end_date:end_date,price :price ,pick_up_location:pick_up_location}) => {
            // Effectuer un appel gRPC au microservice de films
            const client = new reservationProto.ReservationService('localhost:50052',
                grpc.credentials.createInsecure());
            return new Promise((resolve, reject) => {
                client.addReservation({ customer_id: customer_id, start_date: start_date,end_date:end_date,price :price ,pick_up_location:pick_up_location }, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.tv_show);
                    }
                });
            });
        },
        reservation: (_, { id }) => {
            // Effectuer un appel gRPC au microservice de séries TV
            const client = new reservationProto.ReservationService('localhost:50052',
                grpc.credentials.createInsecure());
            return new Promise((resolve, reject) => {
                client.getReservation({ tv_show_id: id }, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.tv_show);
                    }
                });
            });
        },
        reservations: () => {
            // Effectuer un appel gRPC au microservice de séries TV
            const client = new reservationProto.ReservationService('localhost:50052',
                grpc.credentials.createInsecure());
            return new Promise((resolve, reject) => {
                client.searchReservations({}, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.tv_shows);
                    }
                });
            });
        },
    },
};
module.exports = resolvers;