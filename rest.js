"use strict"

const endpoint = "https://rest-18e89-default-rtdb.europe-west1.firebasedatabase.app/posts";


window.addEventListener("load", start);

async function start(){
    updatePostGrid();
    // const userList = await getUsers();
    // showAllUsers(userList);
    document.querySelector("#newpostbtn").addEventListener("click", createPostClicked);
}

//------------------POSTS-------------------//
async function getPosts(){
    const response = await fetch(`${endpoint}/posts.json`)
    const data = await response.json();
    const posts = preparePostData(data);
    return posts;
}


function preparePostData(dataObject){
    const result = [];
    for (const key in dataObject){
        const post = dataObject[key];
        post.uid = key;
        result.push(post);
    }
    return result;
}


function showAllPosts(postList){
    document.querySelector("#postgrid").innerHTML = "";
    for (const post of postList){
        showPost(post);
    }
}


async function showPost(post){
    const originalPoster = await getOP(post.userid);
    const myHTML = /*html*/ `
    <article class="post-grid-item"> 
        <img src="${post.image}" class="gridimage">
        <h3 class="gridtitle">${post.title}</h3>
        <p class="griduser">Posted by: ${originalPoster}</p>
        <button class="deleteButton">Delete</button><button class="updateButton">Update</button>
    </article>
    `;
    document.querySelector("#postgrid").insertAdjacentHTML("beforeend", myHTML);
    document.querySelector("#postgrid article:last-child img").addEventListener("click", clickDatapoint);
    document.querySelector("#postgrid article:last-child .deleteButton").addEventListener("click", deleteClicked);
    document.querySelector("#postgrid article:last-child .updateButton").addEventListener("click", updateClicked);

    function clickDatapoint(){
        document.querySelector("#detailViewPost").showModal();
        displayPostView(post);
    }

    function deleteClicked(){
        document.querySelector("#deleteposttitle").textContent = post.title;
        document.querySelector("#deletepostform").setAttribute("data-id", post.uid);
        document.querySelector("#deletepostconfirm").showModal();
        document.querySelector("#deletepostform").addEventListener("submit", deletePostClicked)
    }

    function updateClicked(){
        document.querySelector("#updatepostmodal").showModal();
        displayUpdateView(post);

    }
}

function deletePostClicked(event){
    event.preventDefault();
    const postid = event.target.getAttribute("data-id");
    deletePost(postid);
}

async function displayPostView(post){
    const originalPoster = await getOP(post.userid);
    document.querySelector("#detailImagePost").src = `${post.image}`;
    document.querySelector("#detailTitlePost").textContent = `${post.title}`;
    document.querySelector("#detailBody").textContent = `${post.body}`;
    document.querySelector("#detailPostedBy").textContent = `Post by ${originalPoster}`;

}

async function getOP(uid){
    const response = await fetch(`${endpoint}/users/${uid}.json`);
    const data = await response.json();
    if(data !== null){
        const result = data.name
        return result;
    }else return `Anon`
}

function createPostClicked(){
    document.querySelector("#createpostmodal").showModal();
    document.querySelector("#createpost").addEventListener("submit", createPost);

}

async function createPost(event){
    event.preventDefault();
    const elements = document.querySelector("#createpost").elements;
    const newPost ={
        title: elements.namedItem("title").value,
        image: elements.namedItem("image").value,
        body: elements.namedItem("body").value,
        userid: elements.namedItem("userid").value
    }
    const postAsJson = JSON.stringify(newPost);

    const res = await fetch(`${endpoint}/posts.json`,{
        method: "POST",
        body: postAsJson
    });
    if(res.ok){
        console.log("success")
        document.querySelector("#createpost").reset();
        document.querySelector("#createpostmodal").close();
        updatePostGrid();
    }
}

function displayUpdateView(post){
    updatePost(post);
}

function updatePost(post) {
    const elements = document.querySelector("#updatepost").elements;
    elements.namedItem("image").value = post.image;
    elements.namedItem("title").value= post.title;
    elements.namedItem("body").value = post.body;
    elements.namedItem("userid").value= post.userid;
    elements.namedItem("postid").value = post.uid;
    document.querySelector("#updatepost").addEventListener("submit", submitUpdate);
}

async function submitUpdate(event){
    event.preventDefault();
    console.log("update");
    const elements = document.querySelector("#updatepost").elements;
    const postid = elements.namedItem("postid").value;
    const postToUpdate = {      
        title: elements.namedItem("title").value,
        image: elements.namedItem("image").value,
        body: elements.namedItem("body").value,
        userid: elements.namedItem("userid").value
        };
    const putAsJson = JSON.stringify(postToUpdate);

    const res = await fetch(`${endpoint}/posts/${postid}.json`,{ 
        method: "PUT", 
        body: putAsJson 
    });

    if(res.ok){
        console.log("success")
        document.querySelector("#updatepost").reset();
        document.querySelector("#updatepostmodal").close();
        updatePostGrid();

    }
}


async function deletePost(id) {
const res = await fetch(`${endpoint}/posts/${id}.json`, { 
    method: "DELETE" 
});
    if(res.ok){
        console.log("success")
        document.querySelector("#deletepostconfirm").close();
        updatePostGrid();
    }
}


async function updatePostGrid() {
    const posts = await getPosts();
    const sortoption = document.querySelector("#sortselector").elements.namedItem("sort").value;
    console.log(sortoption);
    const newpostlist = posts.sort(sortByUserid);
    showAllPosts(newpostlist);
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function sortByTitle(postA, postB){
        return postA.title.localeCompare(postB.title);
}

function sortByUserid(postA, postB){
    return postA.userid.localeCompare(postB.userid);
}




//-------------USERS ----------------//

// async function getUsers(){
//     const response = await fetch(`${endpoint}/users.json`)
//     const data = await response.json();
//     const users = preparePostData(data);
//     return users;
// }

// function showAllUsers(userList){
//     for (const user of userList){
//         showUser(user);
//     }
// }


// function showUser(user){
//     const myHTML = /*html*/ `
//     <tr> 
//         <td><img src="${user.image}"></td>
//         <td>${user.name}</td>
//     </tr>
//     `;
//     document.querySelector("#table2").insertAdjacentHTML("beforeend", myHTML);
//     document.querySelector("#table2 tr:last-child").addEventListener("click", clickDatapoint);
    
//     function clickDatapoint(){
//         document.querySelector("#detailViewUser").showModal();
//         displayUserView(user);
//     }
    
// }

// async function displayUserView(user){
//     document.querySelector("#detailImageUser").src = `${user.image}`;
//     document.querySelector("#detailTitleUser").textContent = `${user.title}`;
//     document.querySelector("#detailName").textContent = `${user.name}`;
//     document.querySelector("#detailMail").textContent = `${user.mail}`;
//     document.querySelector("#detailPhone").textContent = `${user.phone}`;

// }


// async function deleteUser(id) {
// const res = await fetch(`${endpoint}/users/${id}.json`, { 
//     method: "DELETE" 
// });

// console.log(res);

// }
