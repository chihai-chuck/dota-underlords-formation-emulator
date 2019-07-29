const docEl = document.documentElement,
    resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize',
    recalc = () => {
        const clientWidth = docEl.clientWidth;
        if(!clientWidth) return;
        if(innerWidth > 640) {
            docEl.style.fontSize = '32px';
        } else {
            docEl.style.fontSize = clientWidth / 18.75 + 'px';
        }
    };
window.addEventListener(resizeEvt, recalc);
document.addEventListener('DOMContentLoaded', recalc);