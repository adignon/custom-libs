# custom-libs

<h2>This is a custom hooks for react developper.</h2>
<p>It Contains</p>
<ul>
  <li>
    <b>Custome Per-Page Store</b>: 
    This class and its hooks function help you to implement a single runtime store per page that can also be sharable accross pages 
    which actually help you to share data between component by reducing rendering of components. Ex: <i>When you need to share data between two components and the second one is a child of the first component storing
    this data in a page store can be helpfull. Expecially if you dont want to re-render the hole main component and you need to use those data with a callback (event handle for exemple) in the parent component, you just get the dats from the store 
    and continue your work without having to re-render the first component at all. That technic helps you increase your app performance x3</i>
  </li>
   <li>
    <b>Form</b>: 
    This is one of my favorite hook. This an joi validation ready form hook which helps you increase time by easily handling your forms. This provide you with many handlers 
     like <code>handleForm</code> or <code>handleFormValue</code> or <code>handleFormValues</code> etc, that help you implement in no time form handling and 
    <code>isFormValid</code>, <code>getHelperTextOn</code>, <code>isErrorOn</code>, etc, which help you to easly validate your field. It has a lot of functionnalities like saving 
    data to store (localStorage, sessionStorage, or a Storage object) and many more.
  </li>
</ul>
