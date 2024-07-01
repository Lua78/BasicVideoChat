const APP_ID = "c2494836b73e4cf89036741de30f8b93"
const TOKEN = "007eJxTYJju2deZqBQdXd33YDbrX9enHS+36mys+ZBy3feb3B0xLy4FhmQjE0sTC2OzJHPjVJPkNAtLA2MzcxPDlFRjgzSLJEvjJKGmtIZARobbrKqsjAwQCOKzMOQmZuYxMAAARtwebA=="
const CHANNEL = "main"

const client = AgoraRTC.createClient({mode:'rtc', codec:'vp8'})

let localTracks = []
let remoteUsers = {}
let UID = ''

let joinAndDisplayLocalStream = async () => {

    try {
        client.on('user-published', handleUserJoined)
    
        client.on('user-left', handleUserLeft)
        let UID = await client.join(APP_ID, CHANNEL, TOKEN, null)
        localTracks[0] = await AgoraRTC.createMicrophoneAudioTrack()
        localTracks[1] = await AgoraRTC.createCameraVideoTrack()
        
        let player = `<div class="video-container" id="user-container-${UID}">
                            <div class="video-player" id="user-${UID}"></div>
                      </div>`
        document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)
    
        localTracks[1].play(`user-${UID}`)
        
        await client.publish([localTracks[0], localTracks[1]])   
    } catch (error) {
        console.log('AAAA', error)
    }

}

let joinStream = async () => {
    await joinAndDisplayLocalStream()
    document.getElementById('join-btn').style.display = 'none'
    document.getElementById('stream-controls').style.display = 'flex'
}

let handleUserJoined = async (user, mediaType) => {
    remoteUsers[user.uid] = user 
    await client.subscribe(user, mediaType)

    if (mediaType === 'video'){
        let player = document.getElementById(`user-container-${user.uid}`)
        if (player != null){
            player.remove()
        }

        player = `<div class="video-container" id="user-container-${user.uid}">
                        <div class="video-player" id="user-${user.uid}"></div> 
                 </div>`
        document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)

        user.videoTrack.play(`user-${user.uid}`)
    }

    if (mediaType === 'audio'){
        user.audioTrack.play()
    }
}

let handleUserLeft = async (user) => {
    delete remoteUsers[user.uid]
    document.getElementById(`user-container-${user.uid}`).remove()
}

let leaveAndRemoveLocalStream = async () => {
    for(let i = 0; localTracks.length > i; i++){
        localTracks[i].stop()
        localTracks[i].close()
    }

    await client.leave()
    document.getElementById('join-btn').style.display = 'block'
    document.getElementById('stream-controls').style.display = 'none'
    document.getElementById('video-streams').innerHTML = ''
}

let toggleMic = async (e) => {
    if (localTracks[0].muted){
        await localTracks[0].setMuted(false)
        e.target.innerText = 'Mic on'
        e.target.style.backgroundColor = '#318118'
    }else{
        await localTracks[0].setMuted(true)
        e.target.innerText = 'Mic off'
        e.target.style.backgroundColor = '#EE4B2B'
    }
}

let toggleCamera = async (e) => {
    console.log(localTracks)
    if(localTracks[1].muted){
        await localTracks[1].setMuted(false)
        e.target.innerText = 'Camera on'
        e.target.style.backgroundColor = '#318118'
    }else{
        await localTracks[1].setMuted(true)
        e.target.innerText = 'Camera off'
        e.target.style.backgroundColor = '#EE4B2B'
    }
}

document.getElementById('join-btn').addEventListener('click', joinStream)
document.getElementById('leave-btn').addEventListener('click', leaveAndRemoveLocalStream)
document.getElementById('mic-btn').addEventListener('click', toggleMic)
document.getElementById('camera-btn').addEventListener('click', toggleCamera)