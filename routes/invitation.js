


router.post("/",
    validatePipe("query", LedgerSchema, { context: { partial: true } }),
    function (req, res) {
        invite(result, req.user, req.body)
    }
  );