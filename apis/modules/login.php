<?php
include './common.class.php';
$common = new Common();
$common->setCORS();
echo json_encode(
    array(
        "email"     =>"kalesh@k.com",
        "userName"  => "kalesh",
        "userId"    => "1",
        "token"     => "zdasfdsa6r5sad674ads6765"
    )
);