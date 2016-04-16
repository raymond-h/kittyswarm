#!/usr/bin/env node

import minimist from 'minimist';
import signalhub from 'signalhub';
import SimplePeer from 'simple-peer';
import wrtc from 'wrtc';

const argv = minimist(process.argv.slice(2), {
    default: {
        'signalhub': [],
        'user': 'user-' + Math.random(),
        'room': 'main'
    },
    alias: {
        'signalhub': 's',
        'user': 'u',
        'room': 'r'
    }
});

const signalhubs = [].concat(argv.signalhub);

const hub = signalhub('wrtccat', signalhubs);

const roomName = argv.room;
const user = argv.user;

hub.broadcast(roomName, {
    type: 'connected',
    user
});

const subber =
    hub.subscribe(roomName)
    .on('data', data => {
        if(data.user === user) return;

        switch(data.type) {
            case 'connected': {
                hub.broadcast(roomName, {
                    type: 'requestConnect',
                    user,
                    to: data.user
                });
                initiatePeerness(data.user, false);
                break;
            }

            case 'requestConnect': {
                initiatePeerness(data.user, true);
                break;
            }
        }
    });

function initiatePeerness(who, initiator) {
    subber
    .on('data', data => {
        if(data.type === 'signal' && data.user === who) {
            peer.signal(data.data);
        }
    });

    const peer = new SimplePeer({
        initiator, wrtc
    });

    peer
    .on('signal', data => {
        hub.broadcast(roomName, { user, type: 'signal', data });
    })
    .on('connect', () => {
        subber.removeAllListeners('data');
        process.stdin.pipe(peer).pipe(process.stdout);
    });
}
