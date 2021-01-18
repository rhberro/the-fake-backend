import express from 'express';
import { ApolloServer, gql } from 'apollo-server-express';
import { readFixtureSync } from './files';

function useResolverWithFixture(prefix: String) {
  return function useResolverWithFixtureResolver(
    _: any,
    __: any,
    ___: any,
    info: any
  ) {
    const { fieldName } = info;
    return readFixtureSync(prefix + fieldName + '.json');
  };
}

function createQueryResolver(carrier: {}, field: any) {
  const {
    name: { value },
  } = field;
  return {
    ...carrier,
    [value]: useResolverWithFixture('graphql/queries/'),
  };
}

function createMutationResolver(carrier: {}, field: any) {
  const {
    name: { value },
  } = field;
  return {
    ...carrier,
    [value]: useResolverWithFixture('graphql/mutations/'),
  };
}

function findQueryDefinitions(definition: any) {
  return definition.name.value === 'Query';
}

function findMutationDefinitions(definition: any) {
  return definition.name.value === 'Mutation';
}

export class GraphQLManager {
  private definitions: any;

  constructor(definitions: TemplateStringsArray | string) {
    this.definitions = gql(definitions);
  }

  private hasQueryDefinitions() {
    return !!this.definitions.definitions.find(findQueryDefinitions);
  }

  private getGraphQLQueries() {
    return this.definitions.definitions.find(findQueryDefinitions);
  }

  private hasMutationDefinitions() {
    return !!this.definitions.definitions.find(findMutationDefinitions);
  }

  private getGraphQLMutations() {
    return this.definitions.definitions.find(findMutationDefinitions);
  }

  private generateQueriesAndMutations(serverOptions: any) {
    const serverOptionsEnhanced = {
      ...serverOptions,
      resolvers: {},
    };

    if (this.hasQueryDefinitions()) {
      serverOptionsEnhanced.resolvers.Query = this.getGraphQLQueries().fields.reduce(
        createQueryResolver,
        {}
      );
    }
    if (this.hasMutationDefinitions()) {
      serverOptionsEnhanced.resolvers.Mutation = this.getGraphQLMutations().fields.reduce(
        createMutationResolver,
        {}
      );
    }

    return serverOptionsEnhanced;
  }

  applyMiddlewareTo(app: express.Application): ApolloServer {
    const serverOptions = {
      typeDefs: this.definitions,
    };

    const serverOptionsEnhanced = this.generateQueriesAndMutations(
      serverOptions
    );

    const server: ApolloServer = new ApolloServer(serverOptionsEnhanced);

    const middlewareOptions = { app };

    server.applyMiddleware(middlewareOptions);

    return server;
  }
}
