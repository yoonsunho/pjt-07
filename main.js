let mapData = null;
let map = null;
let markers = [];

// 1. data.json 불러오기
fetch('data.json')
    .then(res => res.json())
    .then(data => {
        mapData = data;
        populateProvinces();
        populateBanks();
    });

// 2. 드롭다운 채우기
function populateProvinces() {
    const provinceSel = document.getElementById('province');
    mapData.mapInfo.forEach(item => {
        const opt = document.createElement('option');
        opt.value = item.name;
        opt.textContent = item.name;
        provinceSel.appendChild(opt);
    });
}

function populateCountries(province) {
    const countrySel = document.getElementById('country');
    countrySel.innerHTML = '<option value="">시/군/구를 선택하세요.</option>';
    if (!province) {
        countrySel.disabled = true;
        return;
    }
    const found = mapData.mapInfo.find(item => item.name === province);
    found.countries.forEach(country => {
        const opt = document.createElement('option');
        opt.value = country;
        opt.textContent = country;
        countrySel.appendChild(opt);
    });
    countrySel.disabled = false;
}

function populateBanks() {
    const bankSel = document.getElementById('bank');
    mapData.bankInfo.forEach(bank => {
        const opt = document.createElement('option');
        opt.value = bank;
        opt.textContent = bank;
        bankSel.appendChild(opt);
    });
}

// 3. 드롭다운 이벤트 연결
document.getElementById('province').addEventListener('change', function() {
    populateCountries(this.value);
    // 시/도 선택 전/후 UI 상태 동적 변경
    const countrySel = document.getElementById('country');
    if (!this.value) {
        countrySel.innerHTML = '<option value="">시/군/구를 선택하세요.</option>';
        countrySel.disabled = true;
    }
});

// 4. Kakao 지도 생성
window.onload = function() {
    map = new kakao.maps.Map(document.getElementById('map'), {
        center: new kakao.maps.LatLng(37.5665, 126.9780), // 서울시청
        level: 7
    });
};

// 5. 마커 지우기 함수
function clearMarkers() {
    for (let i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    markers = [];
}

// 6. 검색 버튼 클릭 시 은행 지점 마커 표시
document.getElementById('searchBtn').addEventListener('click', function() {
    const province = document.getElementById('province').value;
    const country = document.getElementById('country').value;
    const bank = document.getElementById('bank').value;
    if (!province || !country || !bank) {
        alert('광역시/도, 시/군/구, 은행을 모두 선택하세요.');
        return;
    }

    clearMarkers();

    const ps = new kakao.maps.services.Places();
    const keyword = `${province} ${country} ${bank}`;
    ps.keywordSearch(keyword, function(data, status) {
        if (status === kakao.maps.services.Status.OK) {
            const bounds = new kakao.maps.LatLngBounds();
            for (let i = 0; i < data.length; i++) {
                const place = data[i];
                const position = new kakao.maps.LatLng(place.y, place.x);

                const marker = new kakao.maps.Marker({
                    map: map,
                    position: position,
                    title: place.place_name
                });
                markers.push(marker);

                const infowindow = new kakao.maps.InfoWindow({
                    content: `<div style="padding:5px;font-size:13px;">${place.place_name}<br>${place.road_address_name || place.address_name}</div>`
                });

                kakao.maps.event.addListener(marker, 'click', function() {
                    infowindow.open(map, marker);
                });

                bounds.extend(position);
            }
            map.setBounds(bounds);
        } else {
            alert('검색 결과가 없습니다.');
        }
    });
});
