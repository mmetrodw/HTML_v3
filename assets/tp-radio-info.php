<?php

// Fetches Shoutcast stream information
function getShoutcastInfo($streamUrl) {
    $url = parse_url($streamUrl);
    $statusUrl = "{$url['scheme']}://{$url['host']}:{$url['port']}/statistics?json=1";
    $mount = $url['path'];
    $content = file_get_contents($statusUrl);
    $data = json_decode($content, true);

    if (isset($data["streams"])) {
        // Find the correct stream
        foreach ($data["streams"] as $stream) {
            if ($stream["streampath"] == $mount || $stream["id"] == substr($mount, 1)) {
                // Explode song title
                $temp = explode("-", $stream["songtitle"]);
                if (count($temp) > 1) {
                    $artist = trim($temp[0]);
                    $title = trim($temp[1]);
                    return ["artist" => $artist, "title" => $title];
                }
                return null;
            }
        }
    }
    return null;
}

// Fetches Icecast stream information
function getIcecastInfo($streamUrl) {
    $url = parse_url($streamUrl);
    $statusUrl = isset($url["port"]) ? "{$url['scheme']}://{$url['host']}:{$url['port']}/status-json.xsl" : "{$url['scheme']}://{$url['host']}/status-json.xsl";
    $content = file_get_contents($statusUrl);
    $data = json_decode($content, true);

    if (isset($data["icestats"]["source"])) {
        $source = $data["icestats"]["source"];
        if (isset($source["title"])) {
            $stream = $source;
        } else {
            foreach ($source as $stream) {
                if ($stream["listenurl"] == $streamUrl) {
                    break;
                }
            }
        }

        $artist = $stream["artist"] ?? null;
        $title = $stream["title"] ?? null;

        if ($title && $artist) {
            return ["artist" => $artist, "title" => $title];
        } elseif ($title) {
            $temp = explode("-", $title);
            if (count($temp) > 1) {
                $artist = trim($temp[0]);
                $title = trim($temp[1]);
                return ["artist" => $artist, "title" => $title];
            }
        }
    }
    return null;
}

// Makes a cURL request to the given URL
function makeCurlRequest($url) {
    $headers = [
        "Accept: application/json",
        "Content-Type: application/json"
    ];
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    // Disable SSL verification
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    $response = curl_exec($ch);
    curl_close($ch);
    return $response;
}

// Fetches the cover image for the given song
function getCoverImage($song) {
    $artistName = $song["artist"];
    $trackName = $song["title"];
    // Set up API request URL
    $url = "https://api.deezer.com/search?q=track:\"".urlencode($trackName)."\"+artist:\"".urlencode($artistName)."\"&limit=1";
    // Make API request using the curl function
    $response = makeCurlRequest($url);
    // Parse API response
    $data = json_decode($response, true);
    return $data['data'][0]['album']['cover_big'] ?? null;
}

// Determines the radio type and fetches the relevant information
function getRadioType($streamUrl, $cover) {
    // Get Headers
    $headers = get_headers($streamUrl, true);
    if (!$headers) {
        return null;
    }

    // Check if Shoutcast attributes are present
    if (isset($headers["icy-notice1"], $headers["icy-notice2"])) {
        $data = getShoutcastInfo($streamUrl);
    // Check if Icecast attributes are present
    } elseif (isset($headers["ice-audio-info"])) {
        $data = getIcecastInfo($streamUrl);
    }

    if ($data && $cover) {
        $data["cover"] = getCoverImage($data);
    }
    return json_encode($data);
}

// Read input data
$json = file_get_contents('php://input');
$data = json_decode($json, true);

// Output the radio type information
echo getRadioType($data["url"], $data["cover"]);

?>