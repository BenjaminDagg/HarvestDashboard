## Harvest Dashboard
Harvest Dashboard is a website that gives growers tools to easily track the progress of their fields through real time graphs, analytics, and predictions . Our goal is to give growers information to improve their harvests and plan for future harvests.


## Install Dependencies

You will need to install Node.js and NPM/Yarn. Yarn is preferred as our package manager. To make it easier to manage Node.js installation versions, it is recommended to use the Node Version Manager (NVM). 

npm install

#### NVM Installation
You can learn how to install NVM from their [README][nvm-github-readme]. NPM should come installed with any version of Node.js installed through NVM. 

#### Yarn Installation
The installation instructions for Yarn are [here][yarn-install-docs].


## Setup and Run

#### Yarn
```sh
 $ yarn # Install package.json dependencies
 
 $ yarn start # Run package.json start script
```



#### NPM
```sh
 $ npm install # Install package.json dependencies
 
 $ node server.js # start user servier, map server, and harvest server in src/server
 
 $ clap dev
```

 The application will be running on http://localhost:3000
 
 [nvm-github-readme]: https://github.com/creationix/nvm#installation
 [yarn-install-docs]: https://yarnpkg.com/lang/en/docs/install/
