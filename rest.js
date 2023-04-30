"use strict"

const endpoint = "https://rest-18e89-default-rtdb.europe-west1.firebasedatabase.app/posts";


window.addEventListener("load", start);

let characters;

function start(){
    updatePostGrid();
    document.querySelector("#newpostbtn").addEventListener("click", createPostClicked);
    document.querySelector("#sortbyselect").addEventListener("change", sortInputChange);
    document.querySelector("#input-search").addEventListener("keyup", searchInputChange);
    document.querySelector("#input-search").addEventListener("search", searchInputChange);
    document.querySelector("#filterby").addEventListener("change", filterByRaceChange);
}

//------------------POSTS-------------------//
async function getPosts(){
    const response = await fetch(`${endpoint}/posts.json`)
    const data = await response.json();
    characters = preparePostData(data);
    return characters;
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
        document.querySelector("#deletepostform").addEventListener("submit", deletePostAccept)
    }

    function updateClicked(){
        document.querySelector("#updatepostmodal").showModal();
        displayUpdateView(post);

    }
}

function deletePostAccept(event){
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
    showAllPosts(posts);
    window.scrollTo({ top: 0, behavior: "smooth" });
}


function searchInputChange(event){
    const value = event.target.value;
    const searchResults = searchByName(value);
    showAllPosts(searchResults);

}

function searchByName(searchValue){
    searchValue = searchValue.toLowerCase();

    const results = characters.filter(checkNames);

    function checkNames(post){
        const name = post.title.toLowerCase();
        return name.includes(searchValue);
    }
    
    return results
}

function sortInputChange(event){
    const value = event.target.value;
    const sortResult = sortByOption(value);
    showAllPosts(sortResult);

}



function sortByOption(sortValue) {
    if(sortValue === "name"){
        return characters.sort(compareName);
    } else if (sortValue === "age"){
        return characters.sort(compareAge);
    } else if (sortValue === "title"){
        return characters.sort(compareTitle);
    }

    function compareName(character1, character2){
        return character1.name.localeCompare(character2.name);
    }
    
    function compareAge(character1, character2){
        return character1.age - character2.age;
    }
    
    function compareTitle(character1, character2){
        return character1.title.localeCompare(character2.title);
    }
}



function filterByRaceChange(event){
    const value = event.target.value;
    const searchResults = filterByRace(value);
    showAllPosts(searchResults);
}

function filterByRace(inputValue){
    inputValue = inputValue.toLowerCase();
    
    if (inputValue === "elf"){
        return characters.filter(filterElf);
    } else if (inputValue === "men"){
        return characters.filter(filterMen);
    } else if (inputValue === "dwarf"){
        return characters.filter(filterDwarf);
    } else if (inputValue === "orc"){
        return characters.filter(filterOrc);
    } else if (inputValue === "ainur"){
        return characters.filter(filterAinur);
    } else if (inputValue === "hobbit"){
        return characters.filter(filterHobbit);
    }


    function filterElf(character){
        console.log("elf");
        const race = character.race.toLowerCase();
        return race.includes(searchValue);
    }    
    
    function filterMen(character){
        console.log("men");
        const race = character.race.toLowerCase();
        return race.includes(searchValue);
    }    
    
    function filterDwarf(character){
        console.log("dwarf");
        const race = character.race.toLowerCase();
        return race.includes(searchValue);
    }    
    
    function filterOrc(character){
        console.log("orc");
        const race = character.race.toLowerCase();
        return race.includes(searchValue);
    }    
    
    function filterAinur(character){
        console.log("ainur");
        const race = character.race.toLowerCase();
        return race.includes(searchValue);
    }    
    
    function filterHobbit(character){
        console.log("hobbit");
        const race = character.race.toLowerCase();
        return race.includes(searchValue);
    }

}



/*{if (inputValue === "race"){
    return posts.filter(checkRace);
    } else if (inputValue === "weapon"){
        return posts.filter(checkWeapon);
    } else if (inputValue === "realm"){
        return posts.filter(checkRealm);
    }  else if (inputValue === "race"){
    return posts.filter(checkRace);
    }  

}*/



// create function to check if sort by updates 
// and then use the sort function selected
// do similair for filter


//create find functionality
//should be able to canibalize from filter so start there





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
