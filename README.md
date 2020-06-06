This CLI is great for trying out how your `docker-compose.yml` file behaves in the cloud, for free and fully anonymously.

Read the blog post: https://medium.com/@mathiaslykkegaardlorenzen/hosting-a-docker-app-without-pushing-an-image-d4503de37b89

# Installation
`npm i @dogger/cli -g`

# Usage
`dogger-compose up --demo`

If you want a non-demo server (one that lives indefinitely in contrast to the 30 minutes that demo servers live), simply omit the `--demo` part.

# Additional commands
All commands can be found via `dogger --help` or `dogger-compose --help`.

## Provisioning a new server instance
- `dogger plan ls` can be used to list all plans.
- `dogger plan provision` can be used to provision a plan.

## Deploying to a cluster
- `dogger-compose up` can be used to deploy a `docker-compose.yml` file to a cluster.

# Learn more
Go to [https://dogger.io](https://dogger.io) to learn more about Dogger in general.