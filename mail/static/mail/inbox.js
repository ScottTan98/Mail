document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // Submit the compose email
  document.querySelector('#compose-form').addEventListener('submit', submit_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {

    // loop and show email 
    emails.forEach(singleEmail => {

      const newEmail = document.createElement('div');
      newEmail.classList.add('card', 'mb-2');
      newEmail.innerHTML = `
      <div class="card-body">
        <p>${singleEmail.sender}</p>
        <p style="font-weight: bold;">${singleEmail.subject}</p>
        <p>${singleEmail.timestamp}</p>
      </div>
      `;

      // change background-color (read/unread)
      singleEmail.read ? newEmail.classList.add('read') : newEmail.classList.add('unread');

      newEmail.addEventListener('click', function(){
        view_email(singleEmail.id)
      });
      document.querySelector('#emails-view').append(newEmail);
      console.log(emails);
    })
  });
}


function submit_email(event) {

  event.preventDefault();

  const composeRecipients = document.querySelector('#compose-recipients');
  const composeSubject =  document.querySelector('#compose-subject')
  const composeBody = document.querySelector('#compose-body')

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: composeRecipients.value ,
        subject: composeSubject.value,
        body: composeBody.value
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
      load_mailbox('sent');
  });
}


function view_email(id) {

    //clear the previous selection
    //document.getElementById('email-view').innerHTML = " "; (same, also can be use)
    document.querySelector('#email-view').innerHTML = " ";
  
    // Show compose view and hide other views
    document.querySelector('#email-view').style.display = 'block';
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';

    fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(email => {
      const emailContent = document.createElement('div');
      emailContent.innerHTML = `
      <div style="display: flex;">
        <p style="font-weight: bold;">From: </p>
        <p>${email.sender}</p>
      </div>
      
      <div style="display: flex;">
        <p style="font-weight: bold;">To: </p>
        <p>${email.recipients}</p>
      </div>

      <div style="display: flex;">
        <p style="font-weight: bold;">Subject: </p>
        <p>${email.subject}</p>
      </div>

      <div style="display: flex;">
        <p style="font-weight: bold;">Timestamp: </p>
        <p>${email.timestamp}</p>
      </div>

      <hr>
      <p style="white-space: pre-line;">${email.body}</p>
      `;
      document.querySelector('#email-view').append(emailContent);
      
      //create archive button logic
      const user_email = document.getElementById("userEmail").innerHTML;

      if (email.recipients == user_email && email.sender != user_email){
        const arch_btn = document.createElement('button');
        arch_btn.innerHTML = email.archived ? "Unarchive" : "Archive";
        arch_btn.addEventListener('click', function() {
          fetch(`/emails/${id}`, {
            method: 'PUT',
            body: JSON.stringify({
                archived: !email.archived
            })
          })
          .then(() => {load_mailbox('archive')})
        });
        document.querySelector('#email-view').append(arch_btn);
      }

      //create reply button logic 
      const reply_btn = document.createElement('button');
      reply_btn.innerHTML = 'Reply';
      reply_btn.addEventListener('click', function(){
        compose_email();
        document.querySelector('#compose-recipients').value = `${email.sender}`;
        let reSubject = email.subject;
        if (reSubject.slice(0, 3) != 'Re:'){
          reSubject = 'Re: ' + email.subject;
        }
        document.querySelector('#compose-subject').value = `${reSubject}`;
        document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.recipients} wrote: ${email.body} `;
      });
      document.querySelector('#email-view').append(reply_btn);

    });

    //Change the unread to read
    fetch(`/emails/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
          read: true
      })
    })

};

