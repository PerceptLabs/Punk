import { z } from 'zod'

/**
 * Example schema for a simple hello world app
 *
 * This demonstrates how to define schemas for Punk Framework apps
 */

export const HelloWorldSchema = z.object({
  title: z.string().default('Hello World'),
  subtitle: z.string().default('Welcome to Punk Framework'),
  content: z.object({
    heading: z.string().default('Get Started'),
    body: z.string().default('Build beautiful, schema-driven apps with AI assistance'),
  }),
})

export type HelloWorldData = z.infer<typeof HelloWorldSchema>

// Example data
export const exampleData: HelloWorldData = {
  title: 'Hello World',
  subtitle: 'A Punk Framework Example',
  content: {
    heading: 'Welcome',
    body: 'This is a simple example demonstrating the Punk Framework.',
  },
}
