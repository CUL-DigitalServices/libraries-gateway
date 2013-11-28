# Cambridge University Library Gateway

The libraries of the University of Cambridge house rich and diverse collections of information resources to support the teaching and research of the University. There are over 100 libraries in Cambridge.

The libraries gateway offers information about each library, as well as a the libraries map and a consolidated search across all libraries.

## Prerequisites

- Apache (2.2.x)
- MySQL (5.5.x)
- Node.js (0.10.x)

## Dependencies

- Bower
- Grunt

## Installation

Considering the prerequisites and dependencies installed, we can now install the pending (node) packages using the following command:

```
bower install
```

```
npm install -d
```

To compile the LESS files, the following command should be run:

```
grunt less:dev
```

The following command will copy all project files to a directory (defaults to ```./dist```) and will minify and hash all the assets (css, js, images):

```
grunt build:'path/to/dir'
```
