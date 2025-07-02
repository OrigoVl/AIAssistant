import './assets/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { DefaultApolloClient } from '@vue/apollo-composable'
import { ApolloClient, InMemoryCache } from '@apollo/client/core'
import App from './App.vue'
import router from './router'

// Create Apollo Client
const apolloClient = new ApolloClient({
  uri: 'http://localhost:4000/graphql',
  cache: new InMemoryCache(),
})

createApp(App)
  .use(createPinia())
  .use(router)
  .provide(DefaultApolloClient, apolloClient)
  .mount('#app')