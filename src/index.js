#!/usr/bin/env node

import minimist from 'minimist';
import signalhub from 'signalhub';
import swarm from 'webrtc-swarm';
import wrtc from 'wrtc';

const argv = minimist(process.argv.slice(2), {
    default: {
        'signalhub': [],
        'user': 'user-' + Math.random(),
        'room': 'main'
    },
    alias: {
        'signalhub': 's'
    }
});

const hub = signalhub('wrtccat', [].concat(argv.signalhub));

const sw = swarm(hub, { wrtc, maxPeers: 1 });

sw.on('peer', (peer, id) => {
    process.stdin.pipe(peer).pipe(process.stdout);
});
