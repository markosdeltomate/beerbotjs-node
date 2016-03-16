# beerbotjs-node

## Getting Started

### Prerequisites

- [Git](https://git-scm.com/)
- [Node.js and npm](nodejs.org) Node ^4.2.3, npm ^2.14.7

### Running

1. Run `npm install` to install server dependencies.

2. Run the following lines:
    `$ sudo usermod -a -G dialout <username>`
    `$ sudo chmod a+rw /dev/ttyACM0`
    Where <username> is your user name in Ubuntu, /dev/ttyACM0 is the detected device of your Arduino board.

3. Configure your app:
    - using example file: conf/app.conf.example.json
    - create conf/app.conf.json and edit secret, appid, etc


## Testing

Running `npm test` will run the unit tests with karma.
