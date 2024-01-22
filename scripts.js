function getResponse(response) {
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  return response.json();
}

function getResult(posts) {
  localStorage.setItem("posts", JSON.stringify(posts));
  displayPosts(posts);
  addDeleteCommentListeners(posts);
}

function deleteComment(commentsKey, commentsContainer, index) {
  const commentNodes = commentsContainer.getElementsByTagName("div");
  if (index >= 0 && index < commentNodes.length) {
    commentNodes[index].remove();
    localStorage.setItem(commentsKey, commentsContainer.innerHTML);
  }
}

function addDeleteCommentListeners(posts) {
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const commentsKey = `comments-${post.id}`;
    const commentsContainer = document.getElementById(`${commentsKey}`);

    if (commentsContainer) {
      const deleteButtons = commentsContainer.getElementsByClassName("delete-comment");
      for (let j = 0; j < deleteButtons.length; j++) {
        deleteButtons[j].addEventListener("click", () => {
          deleteComment(commentsKey, commentsContainer, j);
        });
      }
    }
  }
}

function displayPosts(posts) {
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const commentsKey = `comments-${post.id}`;
    const savedComments = localStorage.getItem(commentsKey);
    
    const newNode = document.createElement("div");
    newNode.setAttribute("id", `post-item-${post.id}`);
    newNode.innerHTML = `
      <h2>${post.title}</h2>
      <p>${post.body}</p>
      <div>
        <input type="text" id="comment-input-${post.id}" placeholder="Scrivi un commento" />
        <button id='button-comment-${post.id}'>Commenta</button>
      </div>
      <div id="${commentsKey}">${savedComments || ''}</div>
      <button id='button-delete-${post.id}'>Elimina post</button>`;

    document.getElementById("post-list").appendChild(newNode);

    document
      .getElementById(`button-delete-${post.id}`)
      .addEventListener("click", () => {
        const filteredPosts = posts.filter((p) => p.id !== post.id);
        localStorage.setItem("posts", JSON.stringify(filteredPosts));
        localStorage.removeItem(commentsKey);
        document.getElementById(`post-item-${post.id}`).remove();
      });

    document
      .getElementById(`button-comment-${post.id}`)
      .addEventListener("click", () => {
        const commentInput = document.getElementById(`comment-input-${post.id}`);
        const commentText = commentInput.value.trim();
        if (commentText !== "") {
          const commentsContainer = document.getElementById(`${commentsKey}`);
          const commentNode = document.createElement("div");
          commentNode.innerHTML = `<p>${commentText}</p><button class="delete-comment">Elimina commento</button>`;
          commentsContainer.appendChild(commentNode);
          commentInput.value = "";

          // Salva il commento in localStorage
          localStorage.setItem(commentsKey, commentsContainer.innerHTML);

          const deleteButtons = commentsContainer.getElementsByClassName("delete-comment");
          for (let j = 0; j < deleteButtons.length; j++) {
            deleteButtons[j].addEventListener("click", () => {
              deleteComment(commentsKey, commentsContainer, j);
            });
          }
        }
      });
  }
}

window.onload = function () {
  const posts = !!localStorage.getItem("posts")
    ? JSON.parse(localStorage.getItem("posts"))
    : null;
  if (!!posts) {
    displayPosts(posts);
    addDeleteCommentListeners(posts);
  } else {
    fetch("https://jsonplaceholder.typicode.com/posts")
      .then(getResponse)
      .then(getResult)
      .catch(error => console.error('Fetch error:', error));
  }
};
