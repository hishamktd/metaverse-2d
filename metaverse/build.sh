## prisma generation
# to the db folder
cd ./packages/db

# generate the prisma client
pnpm prisma generate

# go back to the root folder
cd ../../

## build app
turbo build