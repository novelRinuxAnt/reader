"use strict";

/* =========================================================
   NOVEL RINU'XANT
   READER
   VERSION 4.0 FINAL
   GOOGLE DRIVE + READER CONTROLS
   ========================================================= */


/* =========================================================
   CONFIGURATION
========================================================= */

const DRIVE_IMAGE_URL =
    "https://drive.google.com/thumbnail?id=";

const DRIVE_IMAGE_SIZE =
    "&sz=w2000";

const LOGIN_URL =
    "https://novelrinuxant.github.io/login/";


/*
 * YouTube Soundtrack
 *
 * Video ID:
 * 7qs6RwB9Jp0
 */

const YOUTUBE_VIDEO_ID =
    "7qs6RwB9Jp0";


/*
 * Zoom
 */

const ZOOM_MIN =
    50;

const ZOOM_MAX =
    200;

const ZOOM_STEP =
    10;

let currentZoom =
    100;


/* =========================================================
   ELEMENTS
========================================================= */

const pagesContainer =
    document.getElementById("pages");

const loading =
    document.getElementById("loading");

const errorBox =
    document.getElementById("errorBox");

const errorMessage =
    document.getElementById("errorMessage");

const retryButton =
    document.getElementById("retryButton");

const backButton =
    document.getElementById("backButton");

const logoutButton =
    document.getElementById("logoutButton");

const readerStatus =
    document.getElementById("readerStatus");

const pageCounter =
    document.getElementById("pageCounter");


/*
 * Floating menu
 */

const controlToggle =
    document.getElementById("controlToggle");

const controlMenu =
    document.getElementById("controlMenu");


/*
 * Controls
 */

const soundtrackButton =
    document.getElementById("soundtrackButton");

const soundtrackState =
    document.getElementById("soundtrackState");

const zoomOutButton =
    document.getElementById("zoomOutButton");

const zoomInButton =
    document.getElementById("zoomInButton");

const resetZoomButton =
    document.getElementById("resetZoomButton");

const zoomValueOut =
    document.getElementById("zoomValueOut");

const zoomValueIn =
    document.getElementById("zoomValueIn");

const goToPageButton =
    document.getElementById("goToPageButton");

const fullscreenButton =
    document.getElementById("fullscreenButton");

const themeButton =
    document.getElementById("themeButton");

const themeIcon =
    document.getElementById("themeIcon");

const themeState =
    document.getElementById("themeState");


/*
 * Page navigation
 */

const previousPageButton =
    document.getElementById(
        "previousPageButton"
    );

const nextPageButton =
    document.getElementById(
        "nextPageButton"
    );


/*
 * Page dialog
 */

const pageDialog =
    document.getElementById("pageDialog");

const pageInput =
    document.getElementById("pageInput");

const pageCancelButton =
    document.getElementById(
        "pageCancelButton"
    );

const pageGoButton =
    document.getElementById(
        "pageGoButton"
    );


/*
 * YouTube
 */

const youtubePlayerContainer =
    document.getElementById(
        "youtubePlayerContainer"
    );

const youtubePlayer =
    document.getElementById(
        "youtubePlayer"
    );


/* =========================================================
   DATA
========================================================= */

let readerData =
    null;

let pages =
    [];

let currentPage =
    1;

let youtubeIframe =
    null;

let soundtrackPlaying =
    false;


/* =========================================================
   START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeReader
);


/* =========================================================
   INITIALIZE
========================================================= */

function initializeReader() {

    console.log(
        "Novel RINU'XANT Reader initializing..."
    );


    /*
     * Session utama
     */

    let savedData =
        localStorage.getItem(
            "novelReaderSession"
        );


    /*
     * Session sementara
     */

    if (!savedData) {

        savedData =
            sessionStorage.getItem(
                "novelReaderSession"
            );

    }


    /*
     * Kompatibilitas
     */

    if (!savedData) {

        savedData =
            localStorage.getItem(
                "novelReaderData"
            );

    }


    if (!savedData) {

        savedData =
            sessionStorage.getItem(
                "novelReaderData"
            );

    }


    /*
     * Tidak ada session
     */

    if (!savedData) {

        showError(
            "Data login tidak ditemukan. Silakan login terlebih dahulu."
        );

        return;

    }


    /*
     * Parse
     */

    try {

        readerData =
            JSON.parse(
                savedData
            );

    } catch (error) {

        console.error(
            "Session rusak:",
            error
        );


        clearSessions();


        showError(
            "Data login tidak valid. Silakan login kembali."
        );


        return;

    }


    /*
     * Inisialisasi UI
     */

    initializeControls();


    /*
     * Load reader
     */

    loadReader();

}


/* =========================================================
   LOAD READER
========================================================= */

function loadReader() {

    if (!readerData) {

        showError(
            "Data Reader tidak tersedia."
        );

        return;

    }


    if (
        readerData.loggedIn !== true
    ) {

        showError(
            "Sesi login tidak valid."
        );

        return;

    }


    if (
        !Array.isArray(
            readerData.files
        )
    ) {

        showError(
            "Daftar WebP tidak ditemukan."
        );

        return;

    }


    if (
        readerData.files.length === 0
    ) {

        showError(
            "Tidak ada halaman WebP."
        );

        return;

    }


    pages =
        sortPages(
            readerData.files
        );


    pages =
        pages.filter(
            function(file) {

                return (
                    file &&
                    file.id
                );

            }
        );


    if (!pages.length) {

        showError(
            "ID file WebP tidak ditemukan."
        );

        return;

    }


    currentPage =
        1;


    updateHeader();

    renderPages();

}


/* =========================================================
   SORT
========================================================= */

function sortPages(files) {

    return [...files].sort(
        function(a, b) {

            return (
                getPageNumber(a.name) -
                getPageNumber(b.name)
            );

        }
    );

}


/* =========================================================
   PAGE NUMBER
========================================================= */

function getPageNumber(filename) {

    if (!filename) {

        return 0;

    }


    const match =
        filename.match(
            /(\d+)(?=\.[^.]+$)/
        );


    if (!match) {

        return 0;

    }


    return parseInt(
        match[1],
        10
    );

}


/* =========================================================
   DRIVE IMAGE URL
========================================================= */

function createDriveImageUrl(fileId) {

    return (
        DRIVE_IMAGE_URL +
        encodeURIComponent(fileId) +
        DRIVE_IMAGE_SIZE
    );

}


/* =========================================================
   HEADER
========================================================= */

function updateHeader() {

    if (readerStatus) {

        const username =
            readerData.username || "";


        readerStatus.textContent =
            username
                ? "Pembaca: " + username
                : pages.length +
                  " halaman";

    }


    updatePageCounter();

}


/* =========================================================
   RENDER
========================================================= */

function renderPages() {

    hideLoading();

    hideError();


    if (!pagesContainer) {

        return;

    }


    pagesContainer.innerHTML =
        "";


    pages.forEach(
        function(file, index) {

            createPage(
                file,
                index
            );

        }
    );


    applyZoom();

    updatePageCounter();

}


/* =========================================================
   CREATE PAGE
========================================================= */

function createPage(
    file,
    index
) {

    const page =
        document.createElement(
            "div"
        );


    page.className =
        "page";


    page.dataset.page =
        index + 1;


    const img =
        document.createElement(
            "img"
        );


    const imageUrl =
        createDriveImageUrl(
            file.id
        );


    img.src =
        imageUrl;


    img.alt =
        file.name ||
        "Halaman " +
        (index + 1);


    img.loading =
        index < 3
            ? "eager"
            : "lazy";


    img.decoding =
        "async";


    img.draggable =
        false;


    img.dataset.driveId =
        file.id;


    img.dataset.imageUrl =
        imageUrl;


    /*
     * SUCCESS
     */

    img.onload =
        function() {

            page.classList.add(
                "loaded"
            );


            updatePageCounter();

        };


    /*
     * ERROR
     */

    img.onerror =
        function() {

            console.error(
                "Gagal memuat:",
                file.name,
                imageUrl
            );


            img.style.display =
                "none";


            const error =
                document.createElement(
                    "div"
                );


            error.className =
                "page-error";


            error.textContent =
                "Gagal memuat " +
                (
                    file.name ||
                    "halaman " +
                    (index + 1)
                );


            page.appendChild(
                error
            );

        };


    page.appendChild(
        img
    );


    pagesContainer.appendChild(
        page
    );

}


/* =========================================================
   PAGE COUNTER
========================================================= */

function updatePageCounter() {

    if (!pageCounter || !pages.length) {

        return;

    }


    pageCounter.textContent =
        currentPage +
        " / " +
        pages.length;


    updateNavigationButtons();

}


/* =========================================================
   DETECT CURRENT PAGE
========================================================= */

function detectCurrentPage() {

    const pageElements =
        document.querySelectorAll(
            ".page"
        );


    if (!pageElements.length) {

        return;

    }


    const viewportCenter =
        window.innerHeight / 2;


    let closestPage =
        1;


    let smallestDistance =
        Infinity;


    pageElements.forEach(
        function(page, index) {

            const rect =
                page.getBoundingClientRect();


            if (
                rect.height <= 0
            ) {

                return;

            }


            const center =
                rect.top +
                rect.height / 2;


            const distance =
                Math.abs(
                    center -
                    viewportCenter
                );


            if (
                distance <
                smallestDistance
            ) {

                smallestDistance =
                    distance;


                closestPage =
                    index + 1;

            }

        }
    );


    currentPage =
        closestPage;


    updatePageCounter();

}


/* =========================================================
   SCROLL
========================================================= */

let scrollTimer =
    null;


window.addEventListener(
    "scroll",
    function() {

        if (scrollTimer) {

            return;

        }


        scrollTimer =
            requestAnimationFrame(
                function() {

                    detectCurrentPage();


                    scrollTimer =
                        null;

                }
            );

    },
    {
        passive: true
    }
);


/* =========================================================
   GO TO PAGE
========================================================= */

function goToPage(pageNumber) {

    if (!pages.length) {

        return;

    }


    let target =
        parseInt(
            pageNumber,
            10
        );


    if (
        isNaN(target)
    ) {

        return;

    }


    if (target < 1) {

        target =
            1;

    }


    if (
        target > pages.length
    ) {

        target =
            pages.length;

    }


    const page =
        document.querySelector(
            '.page[data-page="' +
            target +
            '"]'
        );


    if (!page) {

        return;

    }


    currentPage =
        target;


    page.scrollIntoView(
        {
            behavior: "smooth",
            block: "start"
        }
    );


    updatePageCounter();

}


/* =========================================================
   PREVIOUS PAGE
========================================================= */

function previousPage() {

    detectCurrentPage();


    if (
        currentPage <= 1
    ) {

        goToPage(1);

        return;

    }


    goToPage(
        currentPage - 1
    );

}


/* =========================================================
   NEXT PAGE
========================================================= */

function nextPage() {

    detectCurrentPage();


    if (
        currentPage >= pages.length
    ) {

        goToPage(
            pages.length
        );

        return;

    }


    goToPage(
        currentPage + 1
    );

}


/* =========================================================
   NAVIGATION BUTTON STATE
========================================================= */

function updateNavigationButtons() {

    if (previousPageButton) {

        previousPageButton.disabled =
            currentPage <= 1;

    }


    if (nextPageButton) {

        nextPageButton.disabled =
            currentPage >= pages.length;

    }

}


/* =========================================================
   FLOATING MENU
========================================================= */

function initializeControls() {

    /*
     * MENU TOGGLE
     */

    if (controlToggle) {

        controlToggle.addEventListener(
            "click",
            toggleControlMenu
        );

    }


    /*
     * SOUNDTRACK
     */

    if (soundtrackButton) {

        soundtrackButton.addEventListener(
            "click",
            toggleSoundtrack
        );

    }


    /*
     * ZOOM OUT
     */

    if (zoomOutButton) {

        zoomOutButton.addEventListener(
            "click",
            function() {

                changeZoom(
                    -ZOOM_STEP
                );

            }
        );

    }


    /*
     * ZOOM IN
     */

    if (zoomInButton) {

        zoomInButton.addEventListener(
            "click",
            function() {

                changeZoom(
                    ZOOM_STEP
                );

            }
        );

    }


    /*
     * RESET ZOOM
     */

    if (resetZoomButton) {

        resetZoomButton.addEventListener(
            "click",
            function() {

                currentZoom =
                    100;

                applyZoom();

            }
        );

    }


    /*
     * GO TO PAGE
     */

    if (goToPageButton) {

        goToPageButton.addEventListener(
            "click",
            openPageDialog
        );

    }


    /*
     * FULLSCREEN
     */

    if (fullscreenButton) {

        fullscreenButton.addEventListener(
            "click",
            toggleFullscreen
        );

    }


    /*
     * THEME
     */

    if (themeButton) {

        themeButton.addEventListener(
            "click",
            toggleTheme
        );

    }


    /*
     * PAGE PREVIOUS
     */

    if (previousPageButton) {

        previousPageButton.addEventListener(
            "click",
            previousPage
        );

    }


    /*
     * PAGE NEXT
     */

    if (nextPageButton) {

        nextPageButton.addEventListener(
            "click",
            nextPage
        );

    }


    /*
     * PAGE COUNTER
     */

    if (pageCounter) {

        pageCounter.addEventListener(
            "click",
            openPageDialog
        );

    }


    /*
     * DIALOG CANCEL
     */

    if (pageCancelButton) {

        pageCancelButton.addEventListener(
            "click",
            closePageDialog
        );

    }


    /*
     * DIALOG GO
     */

    if (pageGoButton) {

        pageGoButton.addEventListener(
            "click",
            submitPageDialog
        );

    }


    /*
     * ENTER PAGE
     */

    if (pageInput) {

        pageInput.addEventListener(
            "keydown",
            function(event) {

                if (
                    event.key === "Enter"
                ) {

                    submitPageDialog();

                }


                if (
                    event.key === "Escape"
                ) {

                    closePageDialog();

                }

            }
        );

    }


    /*
     * Klik luar menu
     */

    document.addEventListener(
        "click",
        function(event) {

            if (!controlMenu ||
                !controlToggle) {

                return;

            }


            if (
                !controlMenu.contains(
                    event.target
                ) &&
                !controlToggle.contains(
                    event.target
                )
            ) {

                closeControlMenu();

            }

        }
    );


    /*
     * Keyboard
     */

    document.addEventListener(
        "keydown",
        handleKeyboard
    );


    /*
     * Theme awal
     */

    loadTheme();


    /*
     * Zoom awal
     */

    updateZoomDisplay();

}


/* =========================================================
   CONTROL MENU TOGGLE
========================================================= */

function toggleControlMenu(event) {

    if (event) {

        event.stopPropagation();

    }


    if (!controlMenu) {

        return;

    }


    const isOpen =
        !controlMenu.hidden;


    if (isOpen) {

        closeControlMenu();

    } else {

        openControlMenu();

    }

}


/* =========================================================
   OPEN MENU
========================================================= */

function openControlMenu() {

    if (!controlMenu) {

        return;

    }


    controlMenu.hidden =
        false;


    if (controlToggle) {

        controlToggle.classList.add(
            "active"
        );


        controlToggle.setAttribute(
            "aria-expanded",
            "true"
        );

    }

}


/* =========================================================
   CLOSE MENU
========================================================= */

function closeControlMenu() {

    if (!controlMenu) {

        return;

    }


    controlMenu.hidden =
        true;


    if (controlToggle) {

        controlToggle.classList.remove(
            "active"
        );


        controlToggle.setAttribute(
            "aria-expanded",
            "false"
        );

    }

}


/* =========================================================
   ZOOM
========================================================= */

function changeZoom(amount) {

    currentZoom =
        currentZoom +
        amount;


    if (
        currentZoom <
        ZOOM_MIN
    ) {

        currentZoom =
            ZOOM_MIN;

    }


    if (
        currentZoom >
        ZOOM_MAX
    ) {

        currentZoom =
            ZOOM_MAX;

    }


    applyZoom();

}


/* =========================================================
   APPLY ZOOM
========================================================= */

function applyZoom() {

    if (!pagesContainer) {

        return;

    }


    const images =
        pagesContainer.querySelectorAll(
            ".page img"
        );


    images.forEach(
        function(img) {

            img.style.width =
                currentZoom + "%";

            img.style.maxWidth =
                currentZoom > 100
                    ? "none"
                    : "100%";

        }
    );


    if (
        currentZoom !== 100
    ) {

        document.body.classList.add(
            "zoom-active"
        );

    } else {

        document.body.classList.remove(
            "zoom-active"
        );

    }


    updateZoomDisplay();

}


/* =========================================================
   ZOOM DISPLAY
========================================================= */

function updateZoomDisplay() {

    const value =
        currentZoom + "%";


    if (zoomValueOut) {

        zoomValueOut.textContent =
            value;

    }


    if (zoomValueIn) {

        zoomValueIn.textContent =
            value;

    }

}


/* =========================================================
   PAGE DIALOG
========================================================= */

function openPageDialog() {

    if (!pageDialog) {

        return;

    }


    pageDialog.hidden =
        false;


    if (pageInput) {

        pageInput.value =
            currentPage;


        setTimeout(
            function() {

                pageInput.focus();

                pageInput.select();

            },
            50
        );

    }

}


/* =========================================================
   CLOSE DIALOG
========================================================= */

function closePageDialog() {

    if (!pageDialog) {

        return;

    }


    pageDialog.hidden =
        true;

}


/* =========================================================
   SUBMIT PAGE DIALOG
========================================================= */

function submitPageDialog() {

    if (!pageInput) {

        return;

    }


    const target =
        parseInt(
            pageInput.value,
            10
        );


    if (
        isNaN(target)
    ) {

        pageInput.focus();

        return;

    }


    closePageDialog();

    goToPage(
        target
    );

}


/* =========================================================
   FULLSCREEN
========================================================= */

async function toggleFullscreen() {

    try {

        if (!document.fullscreenElement) {

            await document.documentElement.requestFullscreen();

        } else {

            await document.exitFullscreen();

        }

    } catch (error) {

        console.error(
            "Fullscreen error:",
            error
        );

    }

}


/* =========================================================
   THEME
========================================================= */

function toggleTheme() {

    const isLight =
        document.body.classList.toggle(
            "light-theme"
        );


    localStorage.setItem(
        "novelReaderTheme",
        isLight
            ? "light"
            : "dark"
    );


    updateThemeDisplay();

}


/* =========================================================
   LOAD THEME
========================================================= */

function loadTheme() {

    const savedTheme =
        localStorage.getItem(
            "novelReaderTheme"
        );


    if (
        savedTheme === "light"
    ) {

        document.body.classList.add(
            "light-theme"
        );

    } else {

        document.body.classList.remove(
            "light-theme"
        );

    }


    updateThemeDisplay();

}


/* =========================================================
   THEME DISPLAY
========================================================= */

function updateThemeDisplay() {

    const isLight =
        document.body.classList.contains(
            "light-theme"
        );


    if (themeState) {

        themeState.textContent =
            isLight
                ? "LIGHT"
                : "DARK";

    }


    if (themeIcon) {

        themeIcon.textContent =
            isLight
                ? "☾"
                : "☀";

    }

}


/* =========================================================
   YOUTUBE API
========================================================= */

function loadYouTubeAPI() {

    if (
        document.getElementById(
            "youtube-api-script"
        )
    ) {

        return;

    }


    const script =
        document.createElement(
            "script"
        );


    script.id =
        "youtube-api-script";


    script.src =
        "https://www.youtube.com/iframe_api";


    document.head.appendChild(
        script
    );

}


/* =========================================================
   YOUTUBE READY
========================================================= */

window.onYouTubeIframeAPIReady =
    function() {

        console.log(
            "YouTube API ready."
        );

    };


/* =========================================================
   CREATE YOUTUBE PLAYER
========================================================= */

function createYouTubePlayer() {

    if (!youtubePlayer) {

        return;

    }


    if (youtubeIframe) {

        return;

    }


    /*
     * Gunakan iframe resmi YouTube.
     *
     * Playlist berisi video yang sama
     * agar video dapat diulang terus.
     */

    youtubeIframe =
        document.createElement(
            "iframe"
        );


    youtubeIframe.width =
        "1";


    youtubeIframe.height =
        "1";


    youtubeIframe.src =
        "https://www.youtube.com/embed/" +
        YOUTUBE_VIDEO_ID +
        "?autoplay=1" +
        "&loop=1" +
        "&playlist=" +
        YOUTUBE_VIDEO_ID +
        "&controls=0" +
        "&rel=0" +
        "&playsinline=1";


    youtubeIframe.title =
        "Novel RINU'XANT Soundtrack";


    youtubeIframe.allow =
        "autoplay; encrypted-media";


    youtubeIframe.frameBorder =
        "0";


    youtubeIframe.allowFullscreen =
        false;


    youtubePlayer.appendChild(
        youtubeIframe
    );


    console.log(
        "YouTube soundtrack created."
    );

}


/* =========================================================
   SOUNDTRACK
========================================================= */

function toggleSoundtrack() {

    /*
     * User harus menekan tombol.
     *
     * Ini penting karena browser modern
     * dapat memblokir autoplay tanpa
     * interaksi pengguna.
     */

    if (
        !soundtrackPlaying
    ) {

        startSoundtrack();

    } else {

        stopSoundtrack();

    }

}


/* =========================================================
   START SOUNDTRACK
========================================================= */

function startSoundtrack() {

    if (!youtubePlayer) {

        return;

    }


    /*
     * Buat player baru.
     */

    youtubePlayer.innerHTML =
        "";


    youtubeIframe =
        null;


    createYouTubePlayer();


    soundtrackPlaying =
        true;


    updateSoundtrackDisplay();


    console.log(
        "Soundtrack ON."
    );

}


/* =========================================================
   STOP SOUNDTRACK
========================================================= */

function stopSoundtrack() {

    if (youtubePlayer) {

        youtubePlayer.innerHTML =
            "";

    }


    youtubeIframe =
        null;


    soundtrackPlaying =
        false;


    updateSoundtrackDisplay();


    console.log(
        "Soundtrack OFF."
    );

}


/* =========================================================
   SOUNDTRACK DISPLAY
========================================================= */

function updateSoundtrackDisplay() {

    if (!soundtrackState) {

        return;

    }


    soundtrackState.textContent =
        soundtrackPlaying
            ? "ON"
            : "OFF";


    if (soundtrackPlaying) {

        soundtrackButton.classList.add(
            "active"
        );

    } else {

        soundtrackButton.classList.remove(
            "active"
        );

    }

}


/* =========================================================
   KEYBOARD
========================================================= */

function handleKeyboard(event) {

    /*
     * Jangan menangkap keyboard
     * ketika sedang mengetik.
     */

    if (
        event.target &&
        (
            event.target.tagName ===
            "INPUT" ||
            event.target.tagName ===
            "TEXTAREA"
        )
    ) {

        return;

    }


    switch (
        event.key
    ) {

        case "ArrowLeft":

            previousPage();

            break;


        case "ArrowRight":

            nextPage();

            break;


        case "+":

            changeZoom(
                ZOOM_STEP
            );

            break;


        case "=":

            if (
                event.shiftKey
            ) {

                changeZoom(
                    ZOOM_STEP
                );

            }

            break;


        case "-":

            changeZoom(
                -ZOOM_STEP
            );

            break;


        case "0":

            currentZoom =
                100;

            applyZoom();

            break;


        case "Escape":

            closePageDialog();

            closeControlMenu();

            break;

    }

}


/* =========================================================
   BACK
========================================================= */

if (backButton) {

    backButton.addEventListener(
        "click",
        function() {

            window.location.href =
                LOGIN_URL;

        }
    );

}


/* =========================================================
   LOGOUT
========================================================= */

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        function() {

            /*
             * Matikan soundtrack
             */

            stopSoundtrack();


            /*
             * Hapus session
             */

            clearSessions();


            /*
             * Kembali login
             */

            window.location.href =
                LOGIN_URL;

        }
    );

}


/* =========================================================
   CLEAR SESSION
========================================================= */

function clearSessions() {

    localStorage.removeItem(
        "novelReaderSession"
    );


    sessionStorage.removeItem(
        "novelReaderSession"
    );


    localStorage.removeItem(
        "novelReaderData"
    );


    sessionStorage.removeItem(
        "novelReaderData"
    );

}


/* =========================================================
   RETRY
========================================================= */

if (retryButton) {

    retryButton.addEventListener(
        "click",
        function() {

            initializeReader();

        }
    );

}


/* =========================================================
   LOADING
========================================================= */

function hideLoading() {

    if (loading) {

        loading.style.display =
            "none";

    }

}


/* =========================================================
   ERROR
========================================================= */

function showError(message) {

    if (loading) {

        loading.style.display =
            "none";

    }


    if (pagesContainer) {

        pagesContainer.innerHTML =
            "";

    }


    if (errorMessage) {

        errorMessage.textContent =
            message;

    }


    if (errorBox) {

        errorBox.hidden =
            false;

    }

}


/* =========================================================
   HIDE ERROR
========================================================= */

function hideError() {

    if (errorBox) {

        errorBox.hidden =
            true;

    }

}


/* =========================================================
   RESIZE
========================================================= */

window.addEventListener(
    "resize",
    function() {

        detectCurrentPage();

    },
    {
        passive: true
    }
);


/* =========================================================
   INITIAL YOUTUBE API
========================================================= */

loadYouTubeAPI();


/* =========================================================
   INITIAL DISPLAY
========================================================= */

updateSoundtrackDisplay();

updateZoomDisplay();
