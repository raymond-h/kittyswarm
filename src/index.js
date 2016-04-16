#!/usr/bin/env node

import minimist from 'minimist';
import signalhub from 'signalhub';
import swarm from 'webrtc-swarm';
import webrtcNative from 'webrtc-native';

import fs from 'fs';
import path from 'path';

const argv = minimist(process.argv.slice(2), {
    default: {
        'signalhub':
            process.env['KITTYSWARM_SIGNALHUB_URL'] ?
            process.env['KITTYSWARM_SIGNALHUB_URL'].split(',') :
            []
    },
    alias: {
        'signalhub': 's',
        'help': 'h'
    }
});

if(argv.help) {
    console.log(fs.readFileSync(path.join(__dirname, '../usage.txt'), { encoding: 'utf8' }));

    process.exit(0);
}

const hub = signalhub('wrtccat', [].concat(argv.signalhub));

const sw = swarm(hub, { wrtc: webrtcNative, maxPeers: 1 });

sw.on('peer', (peer, id) => {
    process.stdin.pipe(peer).pipe(process.stdout);
});
