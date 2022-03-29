
import { SchemaRegistry, SchemaType } from '@kafkajs/confluent-schema-registry'
import { get } from 'env-var'
import log from 'barelog'

async function createArtifact () {
  const registry = new SchemaRegistry({
    host: get('REGISTRY_URL').required().asString(),
    auth: {
      username: get('CLIENT_ID').required().asString(),
      password: get('CLIENT_SECRET').required().asString()
    }
  })
  
  // Upload a schema to the registry
  const schema = `
    {
      "type": "record",
      "name": "song",
      "namespace": "com.acme.music",
      "fields": [{ "type": "string", "name": "title" }, { "type": "string", "name": "artist" }]
    }
  `

  log('uploading avro schema')

  const { id } = await registry.register({
      type: SchemaType.AVRO,
      schema
  })

  log('upload success')
  
  // Encode using the uploaded schema
  const payload = { title: 'Pyro', artist: 'King\'s of Leon' }
  const encodedPayload = await registry.encode(id, payload)
  log('encoded payload:', encodedPayload)
  
  // Decode the payload
  const decodedPayload = await registry.decode(encodedPayload)
  log('ddecoded payload:', decodedPayload)
}

createArtifact()
  .then(result => log('upload result:', result))
  .catch(err => log('upload error:', err))
