function byId(id) {
    return document.getElementById(id);
}

// Cross origin page is served by the same server on 127.0.0.1 instead of localhost.
byId('cross-origin-link').href = `${window.location.protocol}//127.0.0.1:${window.location.port}/cross-origin.html`;

byId('click-button').addEventListener('click', () => {
    byId('click-result').textContent = 'clicked';
});
byId('force-click-button').addEventListener('click', () => {
    byId('click-result').textContent = 'force clicked';
});
byId('double-click-button').addEventListener('dblclick', () => {
    byId('click-result').textContent = 'double clicked';
});

function updateViewportSize() {
    byId('viewport-size').textContent = `${window.innerWidth}x${window.innerHeight}`;
}

window.addEventListener('resize', updateViewportSize);
updateViewportSize();

byId('text-input').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        byId('text-result').textContent = `submitted: ${event.target.value}`;
    }
});

byId('scroll-container').addEventListener('scroll', (event) => {
    const element = event.target;

    if (element.scrollTop + element.clientHeight >= element.scrollHeight - 1) {
        byId('scroll-result').textContent = 'scrolled to bottom';
    }
});

byId('select-button').addEventListener('click', () => {
    byId('select-options').classList.add('open');
});
document.querySelectorAll('.option').forEach((option) => {
    option.addEventListener('click', () => {
        byId('select-result').textContent = `selected: ${option.textContent}`;
        byId('select-options').classList.remove('open');
    });
});

byId('draggable').addEventListener('dragstart', (event) => {
    if (event.dataTransfer) {
        event.dataTransfer.setData('text/plain', 'draggable');
    }
});
// Like sortable/kanban libraries, the dragged element is moved into the drop zone while dragged over it.
byId('drop-zone').addEventListener('dragover', (event) => {
    event.preventDefault();

    if (!byId('drop-zone').contains(byId('draggable'))) {
        byId('drop-zone').appendChild(byId('draggable'));
    }
});
byId('drop-zone').addEventListener('drop', (event) => {
    event.preventDefault();
    byId('drop-result').textContent = 'dropped';
});

let moveStart = null;

byId('movable').addEventListener('mousedown', (event) => {
    moveStart = { x: event.clientX, y: event.clientY };
});
document.addEventListener('mousemove', (event) => {
    if (moveStart) {
        byId('move-result').textContent = 'moving';
    }
});
document.addEventListener('mouseup', (event) => {
    if (moveStart) {
        const deltaX = event.clientX - moveStart.x;
        const deltaY = event.clientY - moveStart.y;

        byId('move-result').textContent = deltaX > 0 && deltaY > 0 ? 'moved' : 'not moved';
        moveStart = null;
    }
});

byId('file-input').addEventListener('change', (event) => {
    byId('file-result').textContent = [...event.target.files].map((file) => file.name).join(', ');
});

byId('read-storage-button').addEventListener('click', () => {
    byId('storage-result').textContent = `token: ${localStorage.getItem('token')}`;
});
