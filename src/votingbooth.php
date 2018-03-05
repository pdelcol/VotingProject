<?PHP
    //Verify that the user is actually verified. Kick them to the home page if they are not
    session_start();
    if(!isset($_SESSION['UserID']) || empty($_SESSION['UserID'])){
        header("Location: index.html");
        die();
    }
    //Make connection and pull candidates if for the user
    if(empty($_POST)) {
        $servername = "localhost";
        $username = "root";
        $password = "3a5bda92e6bf62dd9b8ed6a42dc7bc7380e116126916ac5c";
        $conn = mysqli_connect($servername, $username, $password,"vote");
        if (!$conn) {
            printf("Cannot connect to database");
        }
        $year = date("Y");
        $results = mysqli_query($conn,"SELECT * FROM Candidates WHERE YearVote='".$year."'");
        mysqli_close($conn);
    }
    //After the user selects the candidates this is where we would send the info to the blockchain portion of the website
    if(!empty($_POST))
    {

    }
?>
<!DOCTYPE html>
<html>
	<head>
		<title>Voting Booth</title>
        <link rel="stylesheet" type="text/css" href="Assets/styles.css">
	</head>
	<body>
        <header>
            <h1>U.S. Online Voting System</h1>
        </header>
        <content class="content">
            <h1>Please select your vote</h1>
            <div>
                <form class="pres">
                    <h3>Presidential Candidates</h3>
                    <?PHP
                        if(isset($results))
                        {
                            while($row = mysqli_fetch_assoc($results))
                            {
                                echo "<input type='radio' name='".$row['FName']."'>";
                                echo "<label for='".$row['FName']."'>".$row['FName']."</label>";
                            }
                        }
                    ?>
                </form>
            </div>
        </content>
	</body>
</html>