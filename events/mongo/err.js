module.exports = {
   name: "err",
   execute(err) {
    console.log(`[INFO] Error connecting to MongoDB \n${err}`);
   },
};