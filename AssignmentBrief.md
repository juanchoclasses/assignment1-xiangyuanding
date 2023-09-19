### Welcome to your job at ACME Software

<img align="right" src="./media/acme.jpeg" width="400px" alt="picture"> 

Welcome to ACME software.  We are happy to have you on board here at our start up.  

#### Onboarding

Your first assignment (should you choose to accept it) is to pick up a project that Bilbo Baggins was working on when he left the company.   He said he had some sort of important quest or something.  

Anyhow.  What was Bilbo Baggins working on?

### The demonstratable Spreadsheet.

We are building a spreadsheet that will be used by teachers in primary school and early high school to explain how a spreadhsheet works with a simple interface.   This will be the focus of your employment here at ACME Software.

#### The problem we have.

Bilbo was well on his way to getting the work done however he ended up with some code that kinda works.


Bilbo did a couple of things on his way out.   He deleted the core calculator in `FormulaEvaluator.ts`  

He was also required to provide a message when the user was not logged in to the main page.  

He did do us a favor and he left us the unit tests for `FormulaEvaluator.ts` You can find these unit tests in `FormulaEvaluator.test.ts`.  But we are not completely sure that he did not add something there to confuse the people who are replacing him.

### Learning outcomes.
The intention of this assignment is to start you in the world of working in existing code.  Typically when you join a team in a company you are starting to work with existing code.  The first task that most engineers are given is usually to fix a bug.  In this assignment we are having you fix a bug in the existing prototype.   The bug that you are fixing is that there is no indication given to the user when there is no user name in the input element on the page.


The second task that most engineers get is to get up to speed on existing code.   We have fabricated the scenario here to provide you with the experience of having to understand a system, how the system is built, and how the system is deployed.   The calculator that you have inherited will return a number for each calculation (Bilbo had set this up to test the whole system.)

The Third task that most engineers experience is to do a code review.  With this in mind we would like you to do a code review of one of the team mates in your team.   You should update the CodeReview.md file that is included in this repository.

### How the current version works 
short description here and demo in class.



<table>
    <theader>
        <tr>
            <th>
            Item
            </th>
            <th>
            Requirements
            </th>
            <th>
            Rewards
            </th>
        </tr>
    </theader>
<tr>
    <td>
    Implement Calculation engine
    </td>
    <td>
    Implement the calculation engine so that the basic calculator works (it passes the unit testsunit test pass. <br /> Also look out to see if there is a bad unit test
    </td>
    <td>
    30
    </td>
</tr>
<tr>
    <td>
    Implement login warning
    </td>
    <td>
    If the user attempts to interact with the spreadsheet without entering a name they should get a pop up message
    </td>
    <td>
    10
    </td>
</tr>
<tr>
    <td>
    Code Review
    </td>
    <td>
    You have reviewed the code of one of your team mates and have included your report in `CodeReview.md`
    </td>
    <td>
    10
    </td>
</tr>

</table>

### Implementation strategy
1. Implement the missing login functionality
1. Implement the calculator functionality first.  get that working 
1. Do the code review with your team mates, in particular if one of your team mates is struggling do a code review.<br/>
     - If you are struggling, ask for a code review.
1. Do the code review at any point (its better if you do it when the code is not finished)

At the end of this  assignment you should be able to have separate tabs on your browser with different users using the same spread sheet.


### How do you run this thing.

The version of the spreadsheet that you have runs as two processes.   There is a backend server that does the calculation and there is a front end server that renders the spreadsheet and sends request for updates to the backend server.

In order to start the backend server you can do run the DocumentServer.ts by issuing the command 

```bash
npm run start-server
```

at that poinn you should see some thing that looks like this run in that terminal.

```bash
~/C/s/calc-sheet ❯ npm run start-server
Debugger attached.

> calc-sheet@0.1.0 start-server
> ts-node ./src/Server/DocumentServer.ts

Debugger attached.
test.json
test1.json
test2.json
test32.json
test5.json
test999.json
testd.json
xxxtestDocument1.json
xxxtestDocument2.json
xxxtestDocument3.json
listening on port 3005
```

Then in a second terminal you can run the command 

```bash
npm run start

```

This should start your frontend server and will start a tab in your current browser.  In that terminal you will see
```bash
Compiled successfully!

You can now view calc-sheet in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://10.18.195.99:3000

Note that the development build is not optimized.
To create a production build, use npm run build.

webpack compiled successfully
Files successfully emitted, waiting for typecheck results...
Issues checking in progress...
No issues found.
    
```