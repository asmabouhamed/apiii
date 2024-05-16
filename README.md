
#  Required modules:

express: Express.js framework for building the server.

ApolloServer: Apollo Server for GraphQL implementation.

expressMiddleware: Middleware for Apollo Server with Express.js.


grpc: gRPC library for creating gRPC clients and servers.

protoLoader: Utility to load Protocol Buffer definitions

Kafka: data streaming platform.

#   Loading Proto files:

The code loads two proto files: voiture.proto and reservation.proto using protoLoader.
#   Loading Proto files:
The code loads two proto files: voiture.proto and reservation.proto using protoLoader.
#Creating an Apollo Server:
 The code creates an Apollo Server instance with imported type definitions (typeDefs) and resolvers (resolvers).
# Applying Apollo Server middleware:
The Apollo Server middleware is applied to the Express application using expressMiddleware.
# Express routes:
The code defines several Express routes for handling RESTful API requests:

            GET /voitures: Fetches voiture using the jeanService gRPC .

            POST /voitures/add: Creates a new voiture using the voitureService gRPC .

            UPDATE /voitures/update/:id :updates a voiture using the voitureService gRPC. 

            DELETE /voitures/delete/:id: Deletes a voiture using the voitureService gRPC .

            GET /voitures/:id: Retrieves a voiture by ID using the voitureService gRPC .

            GET /reservations: Fetches reservation using the reservationService gRPC .

            POST /reservations/add: Creates a new reservation using the reservationService gRPC .

            GET /reservations/:id: Retrieves a reservation by ID using the reservationService gRPC .
# Starting the server:
 The Express application is started and listens on port 3000.
# Start each service:

   - API Gateway: ` nodemon apiGateway`

   - Reservation Service: ` nodemon reservationMicroservice`

  - Voiture Service: ` nodemon voitureMicroservice`

  - Kafkaa :` ./bin/windows/zookeeper-server-start.bat config/zookeeper.properties`
 	       :`./bin/windows/kafka-server-start.bat config/server.properties` 

Please note that the provided code assumes the presence of the required dependencies, such as the proto files (voiture.proto and reservation.proto),
resolvers, and schema. Make sure you have those files available or modify the code accordingly.  
