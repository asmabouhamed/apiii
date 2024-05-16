const { gql } = require('@apollo/server');
// Définir le schéma GraphQL
const typeDefs = `#graphql
type Voiture {
id: String!
marque : String!
modele : String!
couleur : String!
description: String!
}
type Reservation {
id: String!
customer_id : String!
start_date : String!
end_date : String!
price : String!
car_id : String!
}
type Query {
voiture(id: String!): Voiture
voitures: [Voiture]
reservation(id: String!): Reservation
reservations: [Reservation]
addVoiture(marque : String!,modele : String!,couleur : String!,description: String!): Voiture
addReservation(customer_id : String!,start_date : String!,end_date : String!,price : String!,car_id : String!): Reservation

}
`;
module.exports = typeDefs