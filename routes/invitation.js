


router.post("/",
    validatePipe("query", InvitationSchema, { context: { partial: true } }),
    
    function (req, res) {
        invite(result, req.user, req.body)
    }
  );