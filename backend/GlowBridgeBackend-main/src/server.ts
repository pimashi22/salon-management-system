import app from "./app";
import { ensureDatabaseConnection } from "./config/db";

const port = process.env.PORT ? Number(process.env.PORT) : 3005;

ensureDatabaseConnection()
  .then(() => {
    app.listen(port, () => {
      console.log(`Example app listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to database", err);
    process.exit(1);
  });
