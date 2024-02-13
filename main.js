import mongoose, { connect } from "mongoose";
import propmpt from "prompt-sync";
import { movieModel } from "./index.js"

const main = async () => {
    try {

        await connect("mongodb://127.0.0.1:27017/norav");

        const viewAllMovies = async () => {
            const allMovies = await movieModel.find({})
            console.log(allMovies)
        }

        const addMovie = async () => {
            let newTitle = p("Enter the title of the movie: ")
            let newDirector = p("Enter the name of the movie director: ")
            let newReleaseYear = p("Enter the movie's release year (use numbers): ")
            let newGenre = p("Enter the genre of the movie (separate by commas if there are multiple): ")
            let newRating = p("Enter the ratings of the movie (separate by commas if there are multiple): ")
            let newCast = p("Enter the cast of the movie (separate by commas if there are multiple): ")

            const newMovie = {
                title: newTitle,
                director: newDirector,
                releaseYear: newReleaseYear,
                genres: newGenre.split(","),
                ratings: newRating.split(","),
                cast: newCast.split(",")
            }

            const movieDocument = new movieModel(newMovie)
            await movieDocument.save();

            console.log("you've added", movieDocument.title, " to your list of movies.")
        }

        const manipulateArr = async (field, arr) => {

            console.log(`The movie ${field} are currently: `, arr)

            console.log("Would you like to: \n1. Add to the list? \n2. Remove from the list?")
            let manipulation = p("Answer with the corresponding number: ")

            if (manipulation == "1") {
                const newEl = p( `What item you would like to add? ` )
                arr.push(newEl)

                console.log("you've added ", newEl , "to the list.")

            } else if (manipulation == "2") {

                console.log(`wich item would you like to remove?`)

                arr.map((El, i) => {
                    return console.log(` ${i++}. ${El}`)
                })

                let chosenI = p("Enter the corresponding number: ")

                const removedEl = arr.splice(chosenI, 1)
                console.log(removedEl, ` has been removed from the list.`)
            } else {
                console.log("invalid input, choose a number between 1 and 2.")
            }

            return arr

        }

        const updateMovie = async () => {

            let searchQuery = p("Please enter the name of the movie you want to update: ");
            let chosenMovie = await movieModel.findOne({ title: searchQuery });

            if (chosenMovie === null) {
                console.log("No such movie found in our database.");
                return;
            }

            console.log(`You are updating: ${chosenMovie} \n`)

            console.log(
                "-------------------------------------\n",
                "What field would you like to update?",
                "\n1. Title","\n2. Director","\n3. Release Year","\n4. Genre","\n5. Ratings","\n6. Cast");

            let updateField = p("Choose the corresponding number: ")


            if (updateField == '1' || updateField == '2' || updateField == '3') {

                let replacementData = p("What should we replace it with? ");

                switch (updateField) {
                    case "1":
                        await movieModel.updateOne({ _id: chosenMovie._id }, { title: replacementData })
                        break;
                    case "2":
                        await movieModel.updateOne({ _id: chosenMovie._id }, { director: replacementData })
                        break;
                    case "3":
                        await movieModel.updateOne({ _id: chosenMovie._id }, { releaseYear: replacementData })
                        break;
                    default:
                        console.log("number is invalid, choose a number between 1-6.")
                }
            } else if (updateField == '4' || updateField == '5' || updateField == '6') {

                switch (updateField) {
                    case "4":
                        const genres = chosenMovie.genres
                        const replacementGenres = await manipulateArr("genres", genres)
                        await movieModel.updateOne({ _id: chosenMovie._id }, { genres: replacementGenres })
                        console.log("These are now the new genres: ", replacementGenres)
                        break;
                    case "5":
                        const ratings = chosenMovie.ratings
                        const replacementRatings = await manipulateArr("ratings", ratings)
                        await movieModel.updateOne({ _id: chosenMovie._id }, { ratings: replacementRatings })
                        console.log("These are now the new ratings: ", replacementRatings)
                        break;
                    case "6":
                        const cast = chosenMovie.cast
                        const replacementCast = await manipulateArr("cast", cast)
                        await movieModel.updateOne({ _id: chosenMovie._id }, { cast: replacementCast })
                        console.log("These are now the new cast: ", replacementCast)
                        break;
                    default:
                        console.log("number is invalid, choose a number between 1-6.")
                }

            } else {
                console.log("number is invalid, choose a number between 1-6.")
            }
        }

        const deleteMovie = async () => {
            let delSearchQuery = p("Enter the name of the movie you would like to remove: ")

            let deletedMovie = await movieModel.findOneAndDelete({ title: delSearchQuery })

            if (deletedMovie === null) {
                console.log("No such movie found in our database.");
                return;
            } 
            console.log(`${deletedMovie.title} has been removed from our database`)
        }

        const exitApp = async () => {
            console.log("Goodbye")
            process.exit();
            // runApp = false;
        }

        const p = propmpt();
        let runApp = true;

        while (runApp) {

            console.log(
                "---------------------------------\n", 
                "Menue",
                "\n1. View all movies in database", 
                "\n2. Add a new movie to database", 
                "\n3. Update a movie's information",
                "\n4. Delete a movie from database", 
                "\n5. Exit",
                "\n---------------------------------")

            let input = p("Make a choice by entering a number: ")


            if (input == "1") {
                await viewAllMovies();

            } else if (input == "2") {
                await addMovie()

            } else if (input == "3") {
                await updateMovie();

            } else if (input == "4") {
                await deleteMovie();

            } else if (input == "5") {
                await exitApp();

            } else {
                console.log("Invalid option. Choose a number between 1-5")
            }
        }

    } catch (error) {
        console.error('An error occurred:', error);
    } finally {

        await mongoose.connection.close();
    }
}

main()