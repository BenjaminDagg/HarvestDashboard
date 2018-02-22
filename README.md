
## Install Dependencies

You will need to install Node.js and NPM/Yarn. Yarn is preferred as our package manager. To make it easier to manage Node.js installation versions, it is recommended to use the Node Version Manager (NVM). 

#### NVM Installation
You can learn how to install NVM from their [README][nvm-github-readme]. NPM should come installed with any version of Node.js installed through NVM. 

#### Yarn Installation
The installation instructions for Yarn are [here][yarn-install-docs].

#### Install Application Dependencies
```sh
$ yarn
```

## Setup and Run

#### Yarn
```sh
 $ yarn # Install package.json dependencies
 
 $ yarn start # Run package.json start script
```

#### NPM
```sh
 $ npm install # Install package.json dependencies
 
 $ npm start # Run package.json start script
```

 The application will be running on http://localhost:3000
 
 [nvm-github-readme]: https://github.com/creationix/nvm#installation
 [yarn-install-docs]: https://yarnpkg.com/lang/en/docs/install/
