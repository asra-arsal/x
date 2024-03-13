let posts;
let kind;
let type;

(async () => {
    type = document.getElementById('posts').getAttribute('data-type');
    kind = document.getElementById('posts').getAttribute('data-kind');

    const apiEndpoint = api[kind].get[type];

    const resp = await fetch(apiEndpoint);
    const { success, data, error } = await resp.json();

    if (!success) return handleError('There was an error getting the posts from the database.', error);

    posts = data[kind];

    console.log(posts);

    render[kind](posts);
})();

const render = {
    tweets: (posts) => {
        let articles = '';

        // prettier-ignore
        for (let i = 0; i < posts.length; i++) {
            const post = posts[i];
            const article = `
                <form
                    class="form tweet tweet-form"
                    data-tweet-id="${ post.id }"
                    onsubmit="event.preventDefault();">
                    <!-- THE INDEX -->
                    <p class="form-index">${ i + 1 }</p>

                    <!-- THE ID -->
                    <input
                        type="number"
                        name="id"
                        class="form-input hidden"
                        data-tweet-id="${ post.id }"
                        value="${ post.id }" />

                    <!-- THE FORM CONTAINER -->
                    <div class="form-container">
                        <!-- THE FORM DIVISION -->
                        <div class="form-division">
                            <!-- THE MESSAGE -->
                            <textarea
                                name="message"
                                class="form-textarea"
                                data-tweet-id="${ post.id }"
                                placeholder="What is happening?!">
${ post.message }</textarea
                            >

                            <!-- THE LINK -->
                            <!-- <input
                                type="url"
                                name="link"
                                class="form-input"
                                data-tweet-id="${ post.id }"
                                placeholder="http(s)://(www.)example.org"
                                value="${ post.link }" /> -->

                            <!-- THE TAGS -->
                            <input
                                type="text"
                                name="tags"
                                class="form-input"
                                data-tweet-id="${ post.id }"
                                placeholder="Twitter|elonmusk|Dominos"
                                value="${ post.tags !== null ? post.tags : "" }" />
                        </div>

                        <!-- THE PRIORITY -->
                        <input
                            type="number"
                            name="priority"
                            class="form-input hidden"
                            data-tweet-id="${ post.id }"
                            value="${ post.priority }" />

                        <!-- THE FORM DIVISION -->
                        <div class="form-division">
                            <!-- THE MEDIA -->
                            <section class="form-media" data-tweet-id="${ post.id }">
                                <!-- THE DROP ZONE -->
                                <div class="form-media-drop-zone" data-tweet-id="${ post.id }">Drop media here!</div>

                                <!-- THE GALLERY -->
                                <div class="form-media-gallery hidden" data-tweet-id="${ post.id }"></div>

                                <!-- THE SECONDARY GALLERY -->
                                <div class="form-media-gallery secondary" data-tweet-id="${ post.id }">
                                    <input
                                        type="text"
                                        name="images"
                                        class="form-input hidden"
                                        data-tweet-id="${ post.id }"
                                        value='${ post.media }' />
                                </div>

                                <!-- THE FILE INPUT -->
                                <input type="file" name="files" class="hidden" data-tweet-id="${ post.id }" multiple />

                                <!-- THE MEDIA INPUT -->
                                <input type="text" name="media" class="form-input hidden" data-tweet-id="${ post.id }" />
                            </section>
                        </div>

                        <!-- THE FORM DIVISION -->
                        <div class="form-division">
                            <!-- THE TIME -->
                            <input
                                type="datetime-local"
                                name="time"
                                class="form-input"
                                data-tweet-id="${ post.id }"
                                value="${ post.time !== null ? post.time : "2000-01-01T00:00" }" />
                        </div>

                        <!-- THE BUTTONS -->
                        <section class="reorder-buttons">
                            <button onclick="event.preventDefault(); moveOrderUp(${i})"><i class="fa-regular fa-square-caret-up"></i></button>
                            <button onclick="event.preventDefault(); moveOrderDown(${i})"><i class="fa-regular fa-square-caret-down"></i></button>
                        </section>
                    </div>
                </form>
            `;

            articles += article;
        }

        document.getElementById('posts').innerHTML = articles;

        (() => {
            const imagesInputs = document.querySelectorAll('input[name="images"]');

            imagesInputs.forEach((imagesInput) => {
                const id = imagesInput.getAttribute('data-tweet-id');
                const images =
                    imagesInput.value !== 'null' && imagesInput.value !== '' ? JSON.parse(imagesInput.value) : null;

                const secondaryGallery = document.querySelector(`.form-media-gallery.secondary[data-tweet-id="${id}"]`);

                if (images) {
                    images.forEach((image, index) => {
                        const img = document.createElement('img');
                        img.src = `/media/${image}`;
                        img.alt = `Image #${index + 1}`;
                        img.setAttribute('data-tweet-id', id);

                        secondaryGallery.appendChild(img);
                    });
                    document
                        .querySelector(`.form-media-gallery.secondary[data-tweet-id="${id}"]`)
                        .classList.remove('hidden');
                }
            });
        })();
    },

    retweets: (posts) => {
        let articles = '';

        // prettier-ignore
        for (let i = 0; i < posts.length; i++) {
            const post = posts[i];
            const article = `
            <form
                class="form retweet retweet-form"
                data-retweet-id="${ post.id }"
                onsubmit="event.preventDefault();"
                data-form-type="${type}">
                <!-- THE INDEX -->
                <p class="form-index">${ i + 1 }</p>

                <!-- THE ID -->
                <input
                    type="number"
                    name="id"
                    class="form-input hidden"
                    data-retweet-id="${ post.id }"
                    value="${ post.id }" />

                <!-- THE FORM CONTAINER -->
                <div class="form-container">
                    <!-- THE FORM DIVISION -->
                    <div class="form-division">
                        <!-- THE RETWEET LINK -->
                        <input
                            type="url"
                            name="link"
                            class="form-input"
                            data-retweet-id="${ post.id }"
                            placeholder="http(s)://(www.)twitter.com/username/status/123456"
                            pattern="^https:\/\/twitter\.com\/(\w*)\/status\/(\d*)"
                            value="${ post.link }" />

                        <!-- THE TIME -->
                        <input
                            type="datetime-local"
                            name="time"
                            class="form-input"
                            data-retweet-id="${ post.id }"
                            value="${ post.time !== null ? post.time : "2000-01-01T00:00" }" />
                    </div>

                    <!-- THE PRIORITY -->
                    <input
                        type="number"
                        name="priority"
                        class="form-input hidden"
                        data-retweet-id="${ post.id }"
                        value="${ post.priority }" />

                    <!-- THE BUTTONS -->
                    <section class="reorder-buttons">
                        <button onclick="event.preventDefault(); moveOrderUp(${i})"><i class="fa-regular fa-square-caret-up"></i></button>
                        <button onclick="event.preventDefault(); moveOrderDown(${i})"><i class="fa-regular fa-square-caret-down"></i></button>
                    </section>
                </div>
            </form>
            `;

            articles += article;
        }

        document.getElementById('posts').innerHTML = articles;
    },
};

const renderPosts = (posts) => {
    let articles = '';

    // prettier-ignore
    posts.forEach((post, index) => {
        const article = `
            <form class="form" data-form-id="${post.id}" onsubmit="event.preventDefault();">
                <!-- THE INDEX -->
                <p class="form-index">${index + 1}</p>

                <!-- THE HEADING -->
                <h3 class="form-heading" data-form-id="${post.id}">Re-Order Post</h3>

                <!-- THE ID -->
                <input type="number" name="id" class="form-input hidden" data-form-id="${post.id}" value="${post.id}" />

                <!-- THE MESSAGE -->
                <textarea name="message" class="form-textarea" data-form-id="${
                    post.id
                }" placeholder="What's on your mind?">${post.message !== null ? post.message : ""}</textarea>

                <!-- THE LINK -->
                <input type="url" name="link" class="form-input" data-form-id="${
                    post.id
                }" placeholder="http(s)://(www.)example.org" value="${post.link !== null ? post.link : ""}" />

                <!-- THE MEDIA -->
                <section class="form-media" data-form-id="${post.id}">
                    <!-- THE SECONDARY GALLERY -->
                    <div class="form-media-gallery secondary hidden" data-form-id="${post.id}">
                        <input type="text" name="images" class="form-input hidden" data-form-id="${
                            post.id
                        }" value='${post.media}' />
                    </div>
                </section>

                <!-- THE OPTIONS -->
                <section class="form-options" data-form-id="${post.id}">
                    <!-- THE CONTEXT -->
                    <select name="context" class="form-select" data-form-id="${post.id}">
                        <option value="page" ${post.context === 'page' ? 'selected' : ''}>Post to Page</option>
                        <option value="group" ${post.context === 'group' ? 'selected' : ''}>Post to Group</option>
                    </select>

                    <!-- THE PUBLISHER -->
                    <select name="publisher" class="form-select" data-form-id="${post.id}">
                        <option value="page" ${post.publisher === 'page' ? 'selected' : ''}>Post as Page</option>
                        <option value="user" ${post.publisher === 'user' ? 'selected' : ''}>Post as User</option>
                    </select>
                </section>

                <!-- THE TIME -->
                <input type="datetime-local" name="time" class="form-input" data-form-id="${post.id}" value="${post.time}" />

                <!-- THE BUTTONS -->
                <section class="reorder-buttons">
                    <button onclick="event.preventDefault(); moveOrderUp(${index})"><i class="fa-regular fa-square-caret-up"></i></button>
                    <button onclick="event.preventDefault(); moveOrderDown(${index})"><i class="fa-regular fa-square-caret-down"></i></button>
                </section>
            </form>
        `;

        articles += article;
    });

    document.getElementById('posts').innerHTML = articles;

    (() => {
        const imagesInputs = document.querySelectorAll('input[name="images"]');

        imagesInputs.forEach((imagesInput) => {
            const id = imagesInput.getAttribute('data-form-id');
            const images = imagesInput.value !== 'null' ? JSON.parse(imagesInput.value) : null;

            const secondaryGallery = document.querySelector(`.form-media-gallery.secondary[data-form-id="${id}"]`);

            if (images) {
                images.forEach((image, index) => {
                    const img = document.createElement('img');
                    img.src = `/media/${image}`;
                    img.alt = `Image #${index + 1}`;
                    img.setAttribute('data-form-id', id);

                    secondaryGallery.appendChild(img);
                });
                document
                    .querySelector(`.form-media-gallery.secondary[data-form-id="${id}"]`)
                    .classList.remove('hidden');
            }
        });
    })();
};

const array_move = (arr, old_index, new_index) => {
    if (new_index >= arr.length) {
        let k = new_index - arr.length + 1;
        while (k--) {
            arr.push(undefined);
        }
    }
    arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
    return arr;
};

const moveOrderUp = (t) => {
    if (t > 0) {
        const articles = array_move(posts, t, t - 1);
        render[kind](articles);
    }
};

const moveOrderDown = (t) => {
    if (t < posts.length - 1) {
        const articles = array_move(posts, t, t + 1);
        render[kind](articles);
    }
};

const reOrderPosts = async () => {
    const apiEndpoint = api[kind].reOrder;

    const resp = await fetch(apiEndpoint, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify({ posts: posts }),
    });
    const { success, error } = await resp.json();

    if (!success) return handleError('There was an error changing the order of the posts!', error);

    window.location.href = `/${kind}`;
};

const cancelReOrder = () => {
    window.location.href = `/${kind}`;
};
